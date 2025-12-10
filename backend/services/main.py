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
# Define all your models here
MODELS = {
    "letters": {
        "path": os.path.join(MODEL_DIR, "model_rf_336.p"),
        "description": "ASL alphabet and numbers recognition",
        "labels_path": None
    },
    "gestures": {
        "path": os.path.join(MODEL_DIR, "model_rf_336_phrases.p"),
        "description": "ASL gestures and phrases recognition",
        "labels_path": os.path.join(MODEL_DIR, "label_names.json")
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
def load_model_safely(model_path, labels_path=None):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    with open(model_path, "rb") as f:
        obj = pickle.load(f)

    model = obj.get("model", obj)
    meta_classes = obj.get("classes", None)
    n_features = getattr(model, "n_features_in_", None)

    label_names = None
    
    # 1. Try loading from external JSON if provided
    if labels_path and os.path.exists(labels_path):
        try:
            with open(labels_path, "r", encoding="utf-8") as f:
                label_names = json.load(f)
        except Exception as e:
            print(f"[WARN] Failed to load labels from {labels_path}: {e}")

    # 2. Key fallbacks if JSON didn't work or wasn't provided
    if not label_names:
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
        model, label_names, n_features = load_model_safely(
            config["path"], 
            labels_path=config.get("labels_path")
        )
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
            
            # Handle target updates (both models)
            if "target" in data:
                t = data["target"]
                if not t: 
                    t = None
                if hasattr(state, "set_target"):
                    state.set_target(t)

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

            reply = {
                "top": None,
                "conf": None,
                "probs": [],
                "motion": motion_level,
                "hand_conf": hand_confidence,
                "n_features": int(current_n_features),
                "mode": state.mode if isinstance(state, LettersSessionState) else None,
                "model": state.model_name,
            }

            if state.proba_buffer:
                proba_display = np.mean(np.stack(state.proba_buffer, axis=0), axis=0)
                top_idx = int(np.argmax(proba_display))
                top_prob = float(np.max(proba_display))
                top_class = current_labels[top_idx]

                # stability tracking
                if state.stable_idx == top_idx:
                    state.stable_run += 1
                else:
                    state.stable_idx = top_idx
                    state.stable_run = 1

                # DEBUG: always show current best guess, even if unstable
                reply["top"] = top_class
                reply["conf"] = top_prob
                
                if state.target:

                # send top-5 distribution
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