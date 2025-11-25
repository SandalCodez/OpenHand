import cv2
import mediapipe as mp
import numpy as np
import pickle
from collections import deque
from time import time
from pathlib import Path
import json
import os

# ========== CONFIG (accuracy-first) ==========
MODEL_PATH = 'model_rf_336_phrases.p'
LABELS_JSON = 'label_names.json'
CAMERA_INDEX = 0
WIN_NAME = 'ASL Phrases — Live (Accurate)'
CONFIDENCE_BAR = True

# Display & input
UNMIRROR_INPUT = False   # MUST match how training data was captured
MIRROR_DISPLAY = True

# Sliding window / prediction pacing
SEQ_WINDOW = 30          # keep identical to training features
MIN_SEQ_FOR_PRED = 24    # require more context than 20 for cleaner signals
PREDICT_STRIDE = 5       # dense overlap so you don’t miss motion peaks

# Locking & UI thresholds
MIN_CONFIDENCE = 0.31    # sharpen decisions; reduce false positives
STABLE_N = 8             # more consecutive agrees for stability
DISPLAY_MS_AFTER_LOCK = 1000

# Camera caps
CAP_WIDTH = 1280
CAP_HEIGHT = 720
CAP_FPS = 30

# Detection scale (for MediaPipe only)
DETECT_WIDTH = 960       # higher than 640 to resolve fingertips better


# ===========================

# ======= Load model safely (compatible with your older helper) =======
def load_model_safely(model_path):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    with open(model_path, 'rb') as f:
        obj = pickle.load(f)

    # support dict payload from our trainer
    if isinstance(obj, dict) and "model" in obj:
        model = obj["model"]
        label_names = obj.get("label_names") or obj.get("classes")
        n_features = obj.get("feature_dim") or getattr(model, "n_features_in_", None)
    else:
        model = obj
        label_names = None
        n_features = getattr(model, "n_features_in_", None)

    if not label_names and Path(LABELS_JSON).exists():
        try:
            label_names = json.loads(Path(LABELS_JSON).read_text(encoding="utf-8"))
        except Exception:
            pass

    if not label_names:
        # fallback to model.classes_ if present
        classes_ = getattr(model, "classes_", None)
        if classes_ is not None:
            label_names = [str(c) for c in classes_]

    if not label_names:
        raise RuntimeError("Could not resolve label names from model/meta.")

    print("=== MODEL CLASS INSPECTION ===")
    print(f"n_features: {n_features}")
    print(f"label_names ({len(label_names)}): {label_names}")

    return model, label_names, n_features

# ======= MediaPipe init (tracking & lightweight) =======
def initialize_mediapipe():
    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    mp_styles = mp.solutions.drawing_styles

    hands = mp_hands.Hands(
        static_image_mode=False,     # tracking mode = faster
        max_num_hands=2,
        model_complexity=0,          # 0 = light, 1/2 = heavier
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    return mp_hands, mp_draw, mp_styles, hands

# ======= UI helpers (kept like your style) =======
def draw_enhanced_label(img, text, confidence=None, bottom_center=True):
    if text is None:
        return
    h, w = img.shape[:2]
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 2.2
    thickness = 5

    if confidence is not None:
        if confidence >= 0.9:   color = (0, 255, 0)
        elif confidence >= 0.75: color = (0, 255, 255)
        elif confidence >= 0.6:  color = (0, 165, 255)
        else:                    color = (0, 0, 255)
    else:
        color = (255, 255, 255)

    text_disp = f"{text}" + (f" ({confidence*100:.0f}%)" if confidence is not None else "")
    (tw, th), _ = cv2.getTextSize(text_disp, font, font_scale, thickness)
    pad = 18

    if bottom_center:
        cx, cy = w // 2, int(h * 0.86)
        x1 = cx - tw // 2 - pad; y1 = cy - th - pad
        x2 = cx + tw // 2 + pad; y2 = cy + pad
        tx = cx - tw // 2;       ty = cy
    else:
        x1, y1 = 20, 20
        x2, y2 = x1 + tw + 2*pad, y1 + th + 2*pad
        tx, ty = x1 + pad, y1 + th + pad

    overlay = img.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 0, 0), -1)
    cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 3)
    cv2.addWeighted(overlay, 0.8, img, 0.2, 0, img)
    cv2.putText(img, text_disp, (tx, ty), font, font_scale, color, thickness, cv2.LINE_AA)

def draw_info_panel(img, proba, names, k=3, x=20, y=70, dy=30):
    if proba is None:
        cv2.putText(img, "No hands detected", (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        return
    idxs = np.argsort(proba)[::-1][:k]
    for i, idx in enumerate(idxs):
        label = names[idx] if idx < len(names) else str(idx)
        p = proba[idx]
        color = (0, 255, 0) if p >= 0.8 else (0, 255, 255) if p >= 0.6 else (255, 255, 255)
        text = f"{i+1}. {label}: {p*100:.1f}%"
        cv2.putText(img, text, (x, y + i*dy), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

# ======= Landmark → 84D per-frame (xy only, wrist-centered, palm-scaled) =======
def hand_landmarks_xy_from_small(small_bgr, hands_ctx):
    img_rgb = cv2.cvtColor(small_bgr, cv2.COLOR_BGR2RGB)
    res = hands_ctx.process(img_rgb)

    left = None
    right = None
    if res.multi_hand_landmarks and res.multi_handedness:
        for lm, hd in zip(res.multi_hand_landmarks, res.multi_handedness):
            label = hd.classification[0].label.lower()  # 'left'/'right'
            xy = np.array([(pt.x, pt.y) for pt in lm.landmark], dtype=np.float32)  # normalized 0..1
            wrist = xy[0]
            xy -= wrist
            palm = np.linalg.norm(xy[9]) + 1e-6    # wrist->middle_mcp
            xy /= palm
            if label == "left":
                left = xy
            else:
                right = xy

    def pack(xy): return xy.reshape(-1)  # (21,2)->(42,)
    left_vec  = np.zeros(42, dtype=np.float32) if left  is None else pack(left)
    right_vec = np.zeros(42, dtype=np.float32) if right is None else pack(right)
    return np.concatenate([left_vec, right_vec], axis=0), res  # (84,)

# ======= Build 336D from sequence =======
def to_336_from_seq(seq_Tx84):
    M = seq_Tx84
    mu  = M.mean(axis=0)
    sd  = M.std(axis=0) + 1e-6
    dM  = np.diff(M, axis=0)
    dmu = dM.mean(axis=0)
    dsd = dM.std(axis=0) + 1e-6
    return np.concatenate([mu, sd, dmu, dsd], axis=0).astype(np.float32)

def main():
    try:
        model, label_names, n_features = load_model_safely(MODEL_PATH)
        if n_features != 336:
            print(f"[WARN] Model expects {n_features} features; this runner builds 336-D.")

        mp_hands, mp_draw, mp_styles, hands = initialize_mediapipe()

        cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAP_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAP_HEIGHT)
        cap.set(cv2.CAP_PROP_FPS, CAP_FPS)

        if not cap.isOpened():
            raise RuntimeError(f"Cannot open camera {CAMERA_INDEX}")

        cv2.namedWindow(WIN_NAME, cv2.WINDOW_NORMAL)

        # Buffers
        feat84_buffer = deque(maxlen=SEQ_WINDOW)
        proba_buffer = deque(maxlen=8)

        # Stability
        stable_idx = None
        stable_run = 0
        lock_text = None
        lock_until = 0.0
        lock_conf = 0.0

        prev_time = time()
        frame_count = 0
        last_topk = []

        while True:
            ok, frame = cap.read()
            if not ok:
                continue

            if UNMIRROR_INPUT:
                frame = cv2.flip(frame, 1)

            display = frame.copy()
            h, w = display.shape[:2]

            scale = DETECT_WIDTH / float(w)
            small = cv2.resize(frame, (DETECT_WIDTH, int(h * scale)), interpolation=cv2.INTER_AREA)


            # Per-frame 84D features (fast)
            vec84, res = hand_landmarks_xy_from_small(small, hands)
            if vec84 is None:
                feat84_buffer.clear()
            else:
                feat84_buffer.append(vec84)

            # Draw landmarks on display (optional)
            if getattr(res, "multi_hand_landmarks", None):
                for hl in res.multi_hand_landmarks:
                    mp_draw.draw_landmarks(
                        display, hl, mp_hands.HAND_CONNECTIONS,
                        mp_styles.get_default_hand_landmarks_style(),
                        mp_styles.get_default_hand_connections_style()
                    )

            frame_count += 1
            pred_proba = None

            # Predict every PREDICT_STRIDE frames, once we have enough history
            if len(feat84_buffer) >= MIN_SEQ_FOR_PRED and (frame_count % PREDICT_STRIDE == 0):
                seq = np.stack(list(feat84_buffer)[-SEQ_WINDOW:], axis=0)
                X336 = to_336_from_seq(seq).reshape(1, -1)

                if hasattr(model, 'predict_proba'):
                    pred_proba = model.predict_proba(X336)[0]
                else:
                    # fallback: hard prediction
                    yhat = int(model.predict(X336)[0])
                    pred_proba = np.zeros(len(label_names), dtype=np.float32)
                    if 0 <= yhat < len(label_names):
                        pred_proba[yhat] = 1.0

                proba_buffer.append(pred_proba)

            # Smooth display probs
            proba_display = None
            if proba_buffer:
                proba_display = np.mean(np.stack(proba_buffer, axis=0), axis=0)

            # Stable locking
            now = time()
            if proba_display is not None and len(proba_display) > 0:
                top_idx = int(np.argmax(proba_display))
                top_prob = float(np.max(proba_display))

                if stable_idx == top_idx:
                    stable_run += 1
                else:
                    stable_idx = top_idx
                    stable_run = 1

                if stable_run >= STABLE_N and top_prob >= MIN_CONFIDENCE:
                    lock_text = label_names[top_idx] if top_idx < len(label_names) else str(top_idx)
                    lock_conf = top_prob
                    lock_until = now + (DISPLAY_MS_AFTER_LOCK / 1000.0)

            # Big label
            if now < lock_until and lock_text is not None:
                draw_enhanced_label(display, lock_text, lock_conf, bottom_center=True)

            # Side panel
            if CONFIDENCE_BAR:
                draw_info_panel(display, proba_display, label_names)

            # Status line
            fps = 1.0 / max(now - prev_time, 1e-6)
            prev_time = now
            status = f"FPS:{fps:.1f} | Buf:{len(feat84_buffer)} | Stride:{PREDICT_STRIDE} | Feats:336"
            cv2.putText(display, status, (20, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

            cv2.imshow(WIN_NAME, display)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                feat84_buffer.clear(); proba_buffer.clear()
                stable_idx = None; stable_run = 0
                lock_text = None; lock_until = 0.0
                print("[INFO] Buffers reset")

    except Exception as e:
        print(f"[ERROR] {e}")

    finally:
        try:
            cap.release()
        except Exception:
            pass
        try:
            hands.close()
        except Exception:
            pass
        cv2.destroyAllWindows()
        print("[INFO] Cleanup complete")

if __name__ == "__main__":
    main()
