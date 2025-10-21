import cv2
import mediapipe as mp
import numpy as np
import pickle
from collections import deque
from time import time
import os

# ========== CONFIG ==========
# Get the absolute directory of this file (backend/model/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model_rf_336.p")
META_PATH = os.path.join(BASE_DIR, "model_rf_336_meta.p")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(META_PATH, "rb") as f:
        meta = pickle.load(f)
    print("[INFO] Model and metadata loaded successfully.")
except FileNotFoundError as e:
    print(f"[ERROR] Model file not found: {e.filename}")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")

CAMERA_INDEX = 0
WIN_NAME = 'ASL Inference'
CONFIDENCE_BAR = True

# Input/display flips
UNMIRROR_INPUT = False     # If the driver already mirrors and you want to undo it, set True
MIRROR_DISPLAY = False     # Visual preference only

# --- NEW: Recognition mode ---------------------------IMPORTANT: set your default mode here----------------------------------------------------------
# "auto": use all classes; "letters": only letters; "numbers": only 0-9
MODE = "letters"

# Motion gating for letters that require movement
MOTION_ONLY_CLASSES = {'J', 'Z'}
MOTION_THRESHOLD = 0.05

# Smoothing & windowing
SMOOTH_K = 7
SEQ_WINDOW = 30
MIN_SEQ_FOR_PRED = 8

# UI thresholds/colors
MIN_CONFIDENCE = 0.60
STABLE_N = 6
DISPLAY_MS_AFTER_LOCK = 700

# Allowed sets (used by masking)
LETTER_SET = set(list("ABCDEFGHIKLMNOPQRSTUVWXY") + ["J", "Z"])
NUMBER_SET = set(list("0123456789"))
# ===========================


def get_allowed_names(mode: str):
    """Return allowed class-name set based on mode."""
    if mode.lower() == "letters":
        return LETTER_SET
    if mode.lower() == "numbers":
        return NUMBER_SET
    return None  # auto (no restriction)


def get_letter_mapping_from_dirs(data_path=None):
    """Optional helper for manual mapping; not used when model/meta includes names."""
    if data_path and os.path.exists(data_path):
        folders = [f for f in os.listdir(data_path) if os.path.isdir(os.path.join(data_path, f))]
        folders.sort()
        return {i: folder for i, folder in enumerate(folders)}
    return None


def load_model_safely(model_path):
    """Load model, derive label_names (string per class), and feature size."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")

    with open(model_path, 'rb') as f:
        obj = pickle.load(f)

    # Support either {"model":..., "classes":[...]} or a raw estimator
    model = obj.get('model', obj)
    meta_classes = obj.get('classes', None)           # list[str] if saved by our trainer
    n_features = getattr(model, 'n_features_in_', None)

    # Prefer the meta class names; fallback to model.classes_ (indices) mapped to meta if possible
    if isinstance(meta_classes, (list, tuple)) and len(meta_classes) > 0:
        label_names = [str(c) for c in meta_classes]
    else:
        # Fallback: build strings from model.classes_ (often ints); you can still display them
        model_classes = list(getattr(model, 'classes_', []))
        label_names = [str(c) for c in model_classes]

    if not label_names:
        raise RuntimeError("Could not resolve class names from model/meta.")

    print("=== MODEL CLASS INSPECTION ===")
    print(f"n_features: {n_features}")
    print(f"label_names ({len(label_names)}): {label_names}")

    return model, label_names, n_features


def initialize_mediapipe():
    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    mp_styles = mp.solutions.drawing_styles

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5
    )
    return mp_hands, mp_draw, mp_styles, hands


def draw_enhanced_label(img, text, confidence=None, bottom_center=True):
    if text is None:
        return
    h, w = img.shape[:2]
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 2.8
    thickness = 6

    if confidence is not None:
        if confidence >= 0.9:   color = (0, 255, 0)
        elif confidence >= 0.75: color = (0, 255, 255)
        elif confidence >= 0.6:  color = (0, 165, 255)
        else:                    color = (0, 0, 255)
    else:
        color = (255, 255, 255)

    text_disp = f"{text}" + (f" ({confidence*100:.0f}%)" if confidence is not None else "")
    (tw, th), _ = cv2.getTextSize(text_disp, font, font_scale, thickness)
    pad = 20

    if bottom_center:
        cx, cy = w // 2, int(h * 0.85)
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


def draw_info_panel(img, proba, names, motion=None, hand_conf=None, k=3, x=20, y=70, dy=30):
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

    info_y = y + k*dy + 10
    if motion is not None:
        cv2.putText(img, f"Motion: {motion:.4f}", (x, info_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        info_y += 25
    if hand_conf is not None:
        cv2.putText(img, f"Hand Conf: {hand_conf:.2f}", (x, info_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)


# ---- NEW: masking utilities ----
def mask_probs(probs: np.ndarray, label_names, allowed_names_set):
    """
    Keep probabilities only for classes whose names are in allowed_names_set.
    Renormalize to sum=1 if possible; return masked probs (same shape).
    """
    if allowed_names_set is None:
        return probs  # auto mode (no restriction)

    masked = probs.copy()
    for i, name in enumerate(label_names):
        if name not in allowed_names_set:
            masked[i] = 0.0
    s = masked.sum()
    if s > 0:
        masked /= s
    return masked


def main():
    try:
        # Load model and classes
        model, label_names, n_features = load_model_safely(MODEL_PATH)

        # Init MediaPipe
        mp_hands, mp_draw, mp_styles, hands = initialize_mediapipe()

        # Camera
        cap = cv2.VideoCapture(CAMERA_INDEX)
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open camera {CAMERA_INDEX}")

        cv2.namedWindow(WIN_NAME, cv2.WINDOW_NORMAL)

        # Buffers
        feat84_buffer = deque(maxlen=max(SEQ_WINDOW, SMOOTH_K))
        proba_buffer = deque(maxlen=8)

        # Stability
        stable_idx = None
        stable_run = 0
        lock_text = None
        lock_until = 0.0
        lock_confidence = 0.0

        # Mode (live toggling)
        current_mode = MODE
        print(f"[INFO] Starting in MODE={current_mode.upper()}  (press A=letters, N=numbers, M=auto)")
        print("[INFO] Press 'q' to quit, 'r' to reset buffers, SPACE to pause.")

        prev_time = time()

        while True:
            ret, frame = cap.read()
            if not ret:
                print("[ERROR] Failed to read frame")
                break

            if UNMIRROR_INPUT:
                frame = cv2.flip(frame, 1)

            # Inference on non-mirrored frame
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb)

            # What the user sees
            disp_frame = cv2.flip(frame, 1) if MIRROR_DISPLAY else frame.copy()

            # Draw landmarks on the displayed frame
            if results.multi_hand_landmarks:
                for hl in results.multi_hand_landmarks:
                    mp_draw.draw_landmarks(
                        disp_frame, hl, mp_hands.HAND_CONNECTIONS,
                        mp_styles.get_default_hand_landmarks_style(),
                        mp_styles.get_default_hand_connections_style()
                    )

            # Extract features -> probs
            feat84, hand_confidence = feat84_from_results(results)
            pred_proba = None
            motion_level = None

            if feat84 is not None:
                feat84_buffer.append(feat84)

                if n_features == 84:
                    if len(feat84_buffer) >= SMOOTH_K:
                        X = np.mean(np.stack(list(feat84_buffer)[-SMOOTH_K:]), axis=0).reshape(1, -1)
                        if hasattr(model, 'predict_proba'):
                            pred_proba = model.predict_proba(X)[0]

                elif n_features == 336:
                    if len(feat84_buffer) >= MIN_SEQ_FOR_PRED:
                        seq = np.stack(list(feat84_buffer)[-SEQ_WINDOW:], axis=0)
                        motion_level = window_motion_level(seq)

                        if motion_level < MOTION_THRESHOLD:
                            mean = seq.mean(axis=0).astype(np.float32)
                            zeros = np.zeros_like(mean)
                            X336 = np.concatenate([mean, zeros, zeros, zeros], axis=0)
                        else:
                            X336 = to_336_from_seq(seq)

                        X336 = X336.reshape(1, -1)
                        if hasattr(model, 'predict_proba'):
                            pred_proba = model.predict_proba(X336)[0]

                        # Gate out motion-only letters when there's too little motion
                        if pred_proba is not None and motion_level < MOTION_THRESHOLD:
                            for i, name in enumerate(label_names):
                                if name in MOTION_ONLY_CLASSES:
                                    pred_proba[i] = 0.0
                            s = pred_proba.sum()
                            if s > 0:
                                pred_proba = pred_proba / s
            else:
                feat84_buffer.clear()

            # ---- Apply MODE mask (letters / numbers / auto) ----
            if pred_proba is not None:
                allowed = get_allowed_names(current_mode)
                pred_proba = mask_probs(pred_proba, label_names, allowed)
                proba_buffer.append(pred_proba)

            # Smooth display probs
            proba_display = None
            if proba_buffer:
                proba_display = np.mean(np.stack(proba_buffer, axis=0), axis=0)

            # Stable locking for big label
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
                    lock_confidence = top_prob
                    lock_until = now + (DISPLAY_MS_AFTER_LOCK / 1000.0)

            # Draw the main locked label (if any)
            if now < lock_until and lock_text is not None:
                draw_enhanced_label(disp_frame, lock_text, lock_confidence, bottom_center=True)

            # Draw info panel
            if CONFIDENCE_BAR:
                draw_info_panel(disp_frame, proba_display, label_names, motion_level, hand_confidence)

            # Status
            fps = 1.0 / max(now - prev_time, 1e-6)
            prev_time = now
            status_text = f"FPS:{fps:.1f} | Feats:{n_features} | Buf:{len(feat84_buffer)} | MODE:{current_mode.upper()}"
            cv2.putText(disp_frame, status_text, (20, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

            cv2.imshow(WIN_NAME, disp_frame)

            # Keys
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                feat84_buffer.clear(); proba_buffer.clear()
                print("[INFO] Buffers reset")
            elif key == ord(' '):
                cv2.waitKey(0)
            elif key == ord('a'):   # letters-only
                current_mode = "letters"
                feat84_buffer.clear(); proba_buffer.clear()
                print("[MODE] LETTERS")
            elif key == ord('n'):   # numbers-only
                current_mode = "numbers"
                feat84_buffer.clear(); proba_buffer.clear()
                print("[MODE] NUMBERS")
            elif key == ord('m'):   # auto
                current_mode = "auto"
                feat84_buffer.clear(); proba_buffer.clear()
                print("[MODE] AUTO")

    except Exception as e:
        print(f"[ERROR] {e}")

    finally:
        if 'cap' in locals():
            cap.release()
        if 'hands' in locals():
            hands.close()
        cv2.destroyAllWindows()
        print("[INFO] Cleanup complete")


if __name__ == "__main__":
    main()
