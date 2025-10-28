from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import sys
import os
from pathlib import Path
from typing import Optional

# Add model directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent / "model"))

# Import your model utilities
import cv2
import mediapipe as mp
import numpy as np
import pickle

router = APIRouter()

# Load your model once when the service starts
MODEL_PATH = Path(__file__).resolve().parent.parent / "model"/"model_rf_336.p"

class PredictionRequest(BaseModel):
    image_data: str  # base64 encoded image from frontend
    target_label: str

class PredictionResponse(BaseModel):
    predicted_label: str
    confidence: float
    probabilities: dict  # {label: probability}
    success: bool

# Load model at startup
def load_model():
    with open(MODEL_PATH, 'rb') as f:
        obj = pickle.load(f)
    model = obj.get('model', obj)
    label_names = obj.get('classes', [])
    return model, label_names

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.7
)

model, label_names = load_model()

def process_image(image_bytes):
    """Process image and extract hand features"""
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process with MediaPipe
    results = hands.process(rgb)
    
    if not results.multi_hand_landmarks:
        return None
    
    # Extract features (use your existing feat84_from_results function)
    feat84 = extract_features(results)
    return feat84

def extract_features(results):
    """Extract 84D features from MediaPipe results"""
    # Copy your feat84_from_results logic here
    hlists = order_hands(results)
    if not hlists:
        return None
    
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
    
    return np.asarray(feat, dtype=np.float32)

def order_hands(results):
    """Order hands left to right"""
    # Copy your order_hands logic
    if not results.multi_hand_landmarks:
        return []
    hands_list = []
    for hl in results.multi_hand_landmarks:
        mean_x = sum(lm.x for lm in hl.landmark) / 21.0
        label = "Left" if mean_x < 0.5 else "Right"
        hands_list.append((label, hl, 1.0))
    hands_list.sort(key=lambda item: sum(lm.x for lm in item[1].landmark) / 21.0)
    return hands_list[:2]

def to_336_from_seq(seq_Tx84):
    """Convert sequence of 84-D features to 336-D motion features"""
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

@router.post("/api/predict/lesson", response_model=PredictionResponse)
async def predict_lesson(file: UploadFile = File(...), target_label: str = Form(...)):
    """Predict if the sign matches the target label for a lesson"""
    try:
        if not target_label:
            raise HTTPException(status_code=400, detail="target_label is required")
            
        image_bytes = await file.read()
        features = process_image(image_bytes)
        
        if features is None:
            raise HTTPException(status_code=400, detail="No hand detected in image")
        
        # Convert to 336-D
        seq = np.stack([features] * 8, axis=0)
        features_336 = to_336_from_seq(seq)
        
        # Make prediction
        X = features_336.reshape(1, -1)
        proba = model.predict_proba(X)[0]
        
        # Find target label index
        try:
            target_idx = label_names.index(target_label.upper())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Target label '{target_label}' not found in model")
        
        # Get confidence for TARGET ONLY
        target_confidence = float(proba[target_idx])
        
        # Determine if correct (you can adjust threshold)
        CORRECT_THRESHOLD = 0.60
        is_correct = target_confidence >= CORRECT_THRESHOLD
        
        return PredictionResponse(
            predicted_label=target_label if is_correct else "Incorrect",
            confidence=target_confidence,
            probabilities={target_label: target_confidence},
            success=is_correct
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
@router.post("/api/predict/realtime")
async def predict_realtime(request: PredictionRequest):
    """For real-time video predictions from frontend"""
    try:
        # Decode base64 image from React
        import base64
        image_data = base64.b64decode(request.image_data.split(',')[1])
        
        features = process_image(image_data)
        
        if features is None:
            return PredictionResponse(
                predicted_label="",
                confidence=0.0,
                probabilities={},
                success=False
            )
        
        X = features.reshape(1, -1)
        proba = model.predict_proba(X)[0]
        predicted_idx = np.argmax(proba)
        predicted_label = label_names[predicted_idx]
        
        return PredictionResponse(
            predicted_label=predicted_label,
            confidence=float(proba[predicted_idx]),
            probabilities={label_names[i]: float(proba[i]) for i in range(len(proba))},
            success=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))