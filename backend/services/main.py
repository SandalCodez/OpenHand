from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys
import os
import os
import io
import base64
import pickle
import json
import cv2
import numpy as np
from collections import deque
from time import time
from typing import Optional, List, Dict
from fastapi import WebSocket, WebSocketDisconnect, Query
import mediapipe as mp

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# ==========================================
# Import routers from other services
# =========================================
from UserAuth import auth_router as auth_router
from LessonService import lesson_router as lesson_router
from ProgressService import progress_router


# =========================================
# Model Paths and Constants
# ========================================
app = FastAPI(title="OpenHand ASL API", version="1.0.0")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(os.path.dirname(BASE_DIR), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "model_rf_336.p")
META_PATH = os.path.join(MODEL_DIR, "model_rf_336_meta.p")

# ========================================
# Load Model and Define Helpers
# ========================================
MOTION_ONLY_CLASSES = {"J", "Z"}
MOTION_THRESHOLD = 0.05

SMOOTH_K = 7
SEQ_WINDOW = 30
MIN_SEQ_FOR_PRED = 8

LETTER_SET = set(list("ABCDEFGHIKLMNOPQRSTUVWXY") + ["J", "Z"])
NUMBER_SET = set(list("0123456789"))

MIN_CONFIDENCE = 0.60
STABLE_N = 6


TARGET_FPS = 10.0
MIN_DT = 1.0 / TARGET_FPS


def load_model_safely(model_path):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    with open(model_path, "rb") as f:
        obj = pickle.load(f)

    model = obj.get("model", obj)
    meta_classes = obj.get("classes", None)
    n_features = getattr(model, "n_features_in_", None)

    if isinstance(meta_classes, (list, tuple)) and len(meta_classes) > 0:
        label_names = [str(c) for c in meta_classes]
    else:
        model_classes = list(getattr(model, "classes_", []))
        label_names = [str(c) for c in model_classes]
    if not label_names:
        raise RuntimeError("Could not resolve class names from model/meta.")

    return model, label_names, n_features

MODEL, LABEL_NAMES, N_FEATURES = load_model_safely(MODEL_PATH)



mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
mp_styles = mp.solutions.drawing_styles

def init_hands():
    return mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5
    )

def order_hands(results):
    if not getattr(results, 'multi_hand_landmarks', None):
        return []
    hands_list = []
    if getattr(results, "multi_handedness", None):
        for handed, hl in zip(results.multi_handedness, results.multi_hand_landmarks):
            label = handed.classification[0].label
            conf = handed.classification[0].score
            hands_list.append((label, hl, conf))
    else:
        for hl in results.multi_hand_landmarks:
            mean_x = sum(lm.x for lm in hl.landmark) / 21.0
            label = "Left" if mean_x < 0.5 else "Right"
            hands_list.append((label, hl, 1.0))
    
    def sort_key(item):
        _, hl, _ = item
        mean_x = sum(lm.x for lm in hl.landmark) / 21.0
        return mean_x
    
    hands_list.sort(key=sort_key)
    return hands_list[:2]

def feat84_from_results(results):
    hlists = order_hands(results)
    if not hlists:
        return None, 0.0
    hand_conf = float(np.mean([conf for _, _, conf in hlists]))
    xs = [lm.x for _, hl, _ in hlists for lm in hl.landmark]
    ys = [lm.y for _, hl, _ in hlists for lm in hl.landmark]
    min_x, min_y = min(xs), min(ys)
    
    feat = []
    for slot in range(2):
        if slot < len(hlists):
            _, hl, _ = hlists[slot]
            for lm in hl.landmark:
                feat.extend([lm.x - min_x, lm.y - min_y])
        else:
            feat.extend([0.0] * 42)
    return np.asarray(feat, dtype=np.float32), hand_conf

def to_336_from_seq(seq_Tx84):
    T = seq_Tx84.shape[0]
    mean = seq_Tx84.mean(axis=0)
    std = seq_Tx84.std(axis=0)
    last_first = seq_Tx84[-1] - seq_Tx84[0] if T > 1 else np.zeros_like(mean)
    if T >= 2:
        diffs = np.diff(seq_Tx84, axis=0)
        mad = np.mean(np.abs(diffs), axis=0)
    else:
        mad = np.zeros_like(mean)
    return np.concatenate([mean, std, last_first, mad], axis=0).astype(np.float32)

def window_motion_level(seq_Tx84):
    if seq_Tx84.shape[0] < 2:
        return 0.0
    diffs = np.abs(np.diff(seq_Tx84, axis=0))
    return float(diffs.mean())

def get_allowed_names(mode: str):
    m = (mode or "auto").lower()
    if m == "letters": return LETTER_SET
    if m == "numbers": return NUMBER_SET
    return None

def mask_probs(probs: np.ndarray, label_names, allowed_set):
    if allowed_set is None:
        return probs
    masked = probs.copy()
    for i, name in enumerate(label_names):
        if name not in allowed_set:
            masked[i] = 0.0
    s = masked.sum()
    if s > 0:
        masked /= s
    return masked
# =========================================
# WebSocket Endpoint for ASL Recognition
# ========================================

class SessionState:
    def __init__(self, mode: str):
        self.mode = mode
        self.hands = init_hands()
        self.feat84_buffer = deque(maxlen=max(SEQ_WINDOW, SMOOTH_K))
        self.proba_buffer = deque(maxlen=8)
        self.stable_idx = None
        self.stable_run = 0
        self.last_ts = 0.0
    
    def close(self):
        self.hands.close()

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket, mode: str = Query(default="letters")):
    await ws.accept()
    state = SessionState(mode=mode)
    try:
        await ws.send_json({"hello": True, "mode": mode, "n_features": int(N_FEATURES)})
        while True:
            msg = await ws.receive_text()
            try:
                data = json.loads(msg)
            except json.JSONDecodeError:
                continue

            now = time()
            if now - state.last_ts < MIN_DT:
                continue
            state.last_ts = now

            if "mode" in data:
                m = (data["mode"] or "auto").lower()
                if m in ("auto", "letters", "numbers"):
                    state.mode = m
                    state.feat84_buffer.clear()
                    state.proba_buffer.clear()

            b64 = data.get("frame_b64")
            if not b64:
                continue


            try:
                buf = base64.b64decode(b64)
                arr = np.frombuffer(buf, dtype=np.uint8)
                frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                if frame is None:
                    continue
            except Exception:
                continue

            # Inference path (non-mirrored)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = state.hands.process(rgb)

            feat84, hand_confidence = feat84_from_results(results)
            pred_proba = None
            motion_level = None

            if feat84 is not None:
                state.feat84_buffer.append(feat84)

                if N_FEATURES == 84:
                    if len(state.feat84_buffer) >= SMOOTH_K:
                        X = np.mean(
                            np.stack(list(state.feat84_buffer)[-SMOOTH_K:]), axis=0
                        ).reshape(1, -1)
                        if hasattr(MODEL, "predict_proba"):
                            pred_proba = MODEL.predict_proba(X)[0]

                elif N_FEATURES == 336:
                    if len(state.feat84_buffer) >= MIN_SEQ_FOR_PRED:
                        seq = np.stack(list(state.feat84_buffer)[-SEQ_WINDOW:], axis=0)
                        motion_level = window_motion_level(seq)

                        if motion_level < MOTION_THRESHOLD:
                            mean = seq.mean(axis=0).astype(np.float32)
                            zeros = np.zeros_like(mean)
                            X336 = np.concatenate([mean, zeros, zeros, zeros], axis=0)
                        else:
                            X336 = to_336_from_seq(seq)

                        X336 = X336.reshape(1, -1)
                        if hasattr(MODEL, "predict_proba"):
                            pred_proba = MODEL.predict_proba(X336)[0]

                        # gate J/Z without motion
                        if pred_proba is not None and motion_level < MOTION_THRESHOLD:
                            for i, name in enumerate(LABEL_NAMES):
                                if name in MOTION_ONLY_CLASSES:
                                    pred_proba[i] = 0.0
                            s = pred_proba.sum()
                            if s > 0:
                                pred_proba /= s
            else:
                state.feat84_buffer.clear()


            if pred_proba is not None:
                allowed = get_allowed_names(state.mode)
                pred_proba = mask_probs(pred_proba, LABEL_NAMES, allowed)
                state.proba_buffer.append(pred_proba)


            reply = {
                "top": None, "conf": None,
                "probs": [], "motion": motion_level, "hand_conf": hand_confidence,
                "n_features": int(N_FEATURES), "mode": state.mode
            }

            if state.proba_buffer:
                proba_display = np.mean(np.stack(state.proba_buffer, axis=0), axis=0)
                top_idx = int(np.argmax(proba_display))
                top_prob = float(np.max(proba_display))


                if state.stable_idx == top_idx:
                    state.stable_run += 1
                else:
                    state.stable_idx = top_idx
                    state.stable_run = 1

                reply["top"] = LABEL_NAMES[top_idx] if top_idx < len(LABEL_NAMES) else str(top_idx)
                reply["conf"] = top_prob

                idxs = np.argsort(proba_display)[::-1][:5]
                reply["probs"] = [
                    {"name": LABEL_NAMES[i] if i < len(LABEL_NAMES) else str(i), "p": float(proba_display[i])}
                    for i in idxs
                ]

            await ws.send_json(reply)

    except WebSocketDisconnect:
        pass
    finally:
        state.close()
# ========================================
# CORS middleware and Router Inclusion
# =======================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://openhand-9l72bu5i3-estebans-projects-ddc68837.vercel.app",
        "https://openhand-eight.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(lesson_router)
app.include_router(progress_router) 

app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
async def root():
    return {"message": "OpenHand API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)