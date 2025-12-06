from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys
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
from asl_sessions import LettersSessionState, GesturesSessionState


import mediapipe as mp
print(mp.__version__)


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
# =========================================
# Model Paths and Constants
# ========================================
app = FastAPI(title="OpenHand ASL API", version="1.0.0")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(os.path.dirname(BASE_DIR), "model")

# Define all your models here
MODELS = {
    "letters": {
        "path": os.path.join(MODEL_DIR, "model_rf_336.p"),
        "description": "ASL alphabet and numbers recognition"
    },
    "gestures": {
        "path": os.path.join(MODEL_DIR, "model_rf_336_phrases.p"),
        "description": "ASL gestures and phrases recognition"
    }
}

# ========================================
# Constants - MUST BE BEFORE SessionState
# ========================================
# MOTION_ONLY_CLASSES = {"J", "Z"}
# MOTION_THRESHOLD = 0.05

# SMOOTH_K = 7
# SEQ_WINDOW = 30
# MIN_SEQ_FOR_PRED = 12

# LETTER_SET = set(list("ABCDEFGHIKLMNOPQRSTUVWXY") + ["J", "Z"])
# NUMBER_SET = set(list("0123456789"))

# MIN_CONFIDENCE = 0.70
# STABLE_N = 8

# TARGET_FPS = 10.0
# MIN_DT = 1.0 / TARGET_FPS

# ========================================
# Load Model and Define Helpers
# ========================================
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

# Load all models at startup
LOADED_MODELS = {}
for model_name, config in MODELS.items():
    try:
        model, label_names, n_features = load_model_safely(config["path"])
        LOADED_MODELS[model_name] = {
            "model": model,
            "label_names": label_names,
            "n_features": n_features,
            "description": config["description"]
        }
        print(f"✓ Loaded model '{model_name}': {len(label_names)} classes, {n_features} features")
        print(f"  Classes: {', '.join(label_names[:10])}{'...' if len(label_names) > 10 else ''}")
    except Exception as e:
        print(f"✗ Failed to load model '{model_name}': {e}")

# Keep backward compatibility - default to letters model
if "letters" in LOADED_MODELS:
    MODEL = LOADED_MODELS["letters"]["model"]
    LABEL_NAMES = LOADED_MODELS["letters"]["label_names"]
    N_FEATURES = LOADED_MODELS["letters"]["n_features"]
else:
    raise RuntimeError("Failed to load default 'letters' model")

# ========================================
# MediaPipe Setup
# ========================================
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
mp_styles = mp.solutions.drawing_styles

# =======================================
# Helper Functions for Hand Processing
# ======================================

# def init_hands():
#     return mp_hands.Hands(
#         static_image_mode=False,
#         max_num_hands=2,
#         min_detection_confidence=0.7,
#         min_tracking_confidence=0.5
#     )

# def order_hands(results):
    # if not getattr(results, 'multi_hand_landmarks', None):
    #     return []
    # hands_list = []
    # if getattr(results, "multi_handedness", None):
    #     for handed, hl in zip(results.multi_handedness, results.multi_hand_landmarks):
    #         label = handed.classification[0].label
    #         conf = handed.classification[0].score
    #         hands_list.append((label, hl, conf))
    # else:
    #     for hl in results.multi_hand_landmarks:
    #         mean_x = sum(lm.x for lm in hl.landmark) / 21.0
    #         label = "Left" if mean_x < 0.5 else "Right"
    #         hands_list.append((label, hl, 1.0))
    
    # def sort_key(item):
    #     _, hl, _ = item
    #     mean_x = sum(lm.x for lm in hl.landmark) / 21.0
    #     return mean_x
    
    # hands_list.sort(key=sort_key)
    # return hands_list[:2]


# def feat84_from_results(results):
#     hlists = order_hands(results)
#     if not hlists:
#         return None, 0.0
#     hand_conf = float(np.mean([conf for _, _, conf in hlists]))
#     xs = [lm.x for _, hl, _ in hlists for lm in hl.landmark]
#     ys = [lm.y for _, hl, _ in hlists for lm in hl.landmark]
#     min_x, min_y = min(xs), min(ys)
    
#     feat = []
#     for slot in range(2):
#         if slot < len(hlists):
#             _, hl, _ = hlists[slot]
#             for lm in hl.landmark:
#                 feat.extend([lm.x - min_x, lm.y - min_y])
#         else:
#             feat.extend([0.0] * 42)
#     return np.asarray(feat, dtype=np.float32), hand_conf
# def feat84_from_results(results):
#     """Extract 84D features matching training: wrist-centered, palm-scaled"""
#     hlists = order_hands(results)
#     if not hlists:
#         return None, 0.0
    
#     hand_conf = float(np.mean([conf for _, _, conf in hlists]))
    
#     feat = []
#     for slot in range(2):
#         if slot < len(hlists):
#             _, hl, _ = hlists[slot]
#             # Extract as (21, 2) array
#             xy = np.array([(lm.x, lm.y) for lm in hl.landmark], dtype=np.float32)
            
#             # Wrist-center normalization
#             wrist = xy[0]
#             xy -= wrist
            
#             # Palm-scale normalization (wrist to middle finger MCP)
#             palm = np.linalg.norm(xy[9]) + 1e-6
#             xy /= palm
            
#             # Flatten to 42D
#             feat.extend(xy.reshape(-1))
#         else:
#             feat.extend([0.0] * 42)
    
#     return np.asarray(feat, dtype=np.float32), hand_conf

# def to_336_from_seq(seq_Tx84):
#     T = seq_Tx84.shape[0]
#     mean = seq_Tx84.mean(axis=0)
#     std = seq_Tx84.std(axis=0)
#     last_first = seq_Tx84[-1] - seq_Tx84[0] if T > 1 else np.zeros_like(mean)
#     if T >= 2:
#         diffs = np.diff(seq_Tx84, axis=0)
#         mad = np.mean(np.abs(diffs), axis=0)
#     else:
#         mad = np.zeros_like(mean)
#     return np.concatenate([mean, std, last_first, mad], axis=0).astype(np.float32)
# def to_336_from_seq(seq_Tx84):
#     """Match training feature construction EXACTLY"""
#     M = seq_Tx84
#     mu = M.mean(axis=0)
#     sd = M.std(axis=0) + 1e-6  # Critical: prevent division by zero
#     dM = np.diff(M, axis=0)
#     dmu = dM.mean(axis=0)
#     dsd = dM.std(axis=0) + 1e-6
#     return np.concatenate([mu, sd, dmu, dsd], axis=0).astype(np.float32)

# def window_motion_level(seq_Tx84):
#     if seq_Tx84.shape[0] < 2:
#         return 0.0
#     diffs = np.abs(np.diff(seq_Tx84, axis=0))
#     return float(diffs.mean())

# def get_allowed_names(mode: str):
#     m = (mode or "auto").lower()
#     if m == "letters": return LETTER_SET
#     if m == "numbers": return NUMBER_SET
#     return None

# def mask_probs(probs: np.ndarray, label_names, allowed_set):
#     if allowed_set is None:
#         return probs
#     masked = probs.copy()
#     for i, name in enumerate(label_names):
#         if name not in allowed_set:
#             masked[i] = 0.0
#     s = masked.sum()
#     if s > 0:
#         masked /= s
#     return masked

# =========================================
# WebSocket Endpoint for ASL Recognition
# =========================================

# class SessionState:
#     def __init__(self, mode: str, model_name: str = "letters"):
#         self.mode = mode
#         self.model_name = model_name
#         self.hands = init_hands()
#         self.feat84_buffer = deque(maxlen=max(SEQ_WINDOW, SMOOTH_K))  # Now SEQ_WINDOW is defined
#         self.proba_buffer = deque(maxlen=8)
#         self.stable_idx = None
#         self.stable_run = 0
#         self.last_ts = 0.0
    
#     def get_model_info(self):
#         """Get current model, labels, and n_features"""
#         if self.model_name not in LOADED_MODELS:
#             # Fallback to default
#             self.model_name = "letters"
#         return LOADED_MODELS[self.model_name]
    
#     def close(self):
#         self.hands.close()


@app.websocket("/ws")
async def ws_endpoint(
    ws: WebSocket, 
    mode: str = Query(default="auto"),
    model: str = Query(default="letters")
):
    await ws.accept()
    
    # Validate and create appropriate session - PASS LOADED_MODELS
    if model == "letters":
        state = LettersSessionState(mode=mode, loaded_models=LOADED_MODELS)
    elif model == "gestures":
        state = GesturesSessionState(loaded_models=LOADED_MODELS)
    else:
        await ws.send_json({
            "error": f"Invalid model: {model}",
            "available_models": ["letters", "gestures"]
        })
        await ws.close()
        return
    
    model_info = state.get_model_info()
    
    try:
        await ws.send_json({
            "hello": True, 
            "mode": mode if model == "letters" else None,
            "model": model,
            "n_features": int(model_info["n_features"]),
            "n_classes": len(model_info["label_names"])
        })
        
        while True:
            msg = await ws.receive_text()
            try:
                data = json.loads(msg)
            except json.JSONDecodeError:
                continue

            now = time()
            min_dt = 1.0 / 10.0  # 10 FPS
            if now - state.last_ts < min_dt:
                continue
            state.last_ts = now

            # Handle mode changes (letters only)
            if "mode" in data and isinstance(state, LettersSessionState):
                state.set_mode(data["mode"])

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

            # Process frame
            pred_proba, motion_level, hand_confidence = state.process_frame(frame)

            # Get labels for reply
            model_info = state.get_model_info()
            current_labels = model_info["label_names"]
            current_n_features = model_info["n_features"]
            
            # Use model-specific thresholds
            min_conf = state.MIN_CONFIDENCE
            stable_n = state.STABLE_N

            # Build reply
            reply = {
                "top": None, "conf": None,
                "probs": [], "motion": motion_level, "hand_conf": hand_confidence,
                "n_features": int(current_n_features), 
                "mode": state.mode if isinstance(state, LettersSessionState) else None,
                "model": state.model_name
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

                # Only send if stable AND confident
                if state.stable_run >= stable_n and top_prob >= min_conf:
                    reply["top"] = current_labels[top_idx]
                    reply["conf"] = top_prob

                # Always send top 5
                idxs = np.argsort(proba_display)[::-1][:5]
                reply["probs"] = [
                    {"name": current_labels[i], "p": float(proba_display[i])}
                    for i in idxs
                ]

            await ws.send_json(reply)

    except WebSocketDisconnect:
        pass
    finally:
        state.close()

@app.get("/api/models")
async def get_available_models():
    """Get list of available models and their info"""
    return {
        "models": {
            name: {
                "description": info["description"],
                "n_features": info["n_features"],
                "n_classes": len(info["label_names"]),
                "classes": info["label_names"]
            }
            for name, info in LOADED_MODELS.items()
        }
    }
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