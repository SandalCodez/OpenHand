import cv2
import numpy as np
from collections import deque
from typing import Tuple, Optional, Dict, Any
import mediapipe as mp

mp_hands = mp.solutions.hands


# ============================================================================
# LETTERS/NUMBERS SESSION - Matches training in inference_live.py (Document 4)
# ============================================================================

class LettersSessionState:
    """Letters/Numbers model - matches training feature extraction exactly"""
    
    # Constants specific to letters training
    MOTION_ONLY_CLASSES = {"J", "Z"}
    MOTION_THRESHOLD = 0.05
    SMOOTH_K = 7
    SEQ_WINDOW = 30
    MIN_SEQ_FOR_PRED = 12
    MIN_CONFIDENCE = 0.70
    STABLE_N = 8
    
    LETTER_SET = set(list("ABCDEFGHIKLMNOPQRSTUVWXY") + ["J", "Z"])
    NUMBER_SET = set(list("0123456789"))
    
    def __init__(self, mode: str = "auto", loaded_models: Dict[str, Any] = None):
        self.model_name = "letters"
        self.mode = mode  # "letters", "numbers", or "auto"
        self.loaded_models = loaded_models or {}
        self.hands = self._init_hands()
        self.feat84_buffer = deque(maxlen=max(self.SEQ_WINDOW, self.SMOOTH_K))
        self.proba_buffer = deque(maxlen=8)
        self.stable_idx = None
        self.stable_run = 0
        self.last_ts = 0.0
    
    def _init_hands(self):
        """Letters-specific MediaPipe configuration"""
        return mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
    
    def get_model_info(self):
        if self.model_name not in self.loaded_models:
            raise RuntimeError(f"Model '{self.model_name}' not loaded")
        return self.loaded_models[self.model_name]
    
    def set_mode(self, mode: str):
        if mode in ("auto", "letters", "numbers"):
            self.mode = mode
            self.feat84_buffer.clear()
            self.proba_buffer.clear()
    
    def _order_hands(self, results):
        """Letters-specific hand ordering"""
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
    
    def _feat84_from_results(self, results):
        """Letters-specific feature extraction: min-normalized (as originally trained)"""
        hlists = self._order_hands(results)
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
    
    def _to_336_from_seq(self, seq_Tx84):
        """Letters-specific 336D construction"""
        M = seq_Tx84
        mu = M.mean(axis=0)
        sd = M.std(axis=0) + 1e-6
        dM = np.diff(M, axis=0)
        dmu = dM.mean(axis=0)
        dsd = dM.std(axis=0) + 1e-6
        return np.concatenate([mu, sd, dmu, dsd], axis=0).astype(np.float32)
    
    def _window_motion_level(self, seq_Tx84):
        """Calculate motion level for J/Z gating"""
        if seq_Tx84.shape[0] < 2:
            return 0.0
        diffs = np.abs(np.diff(seq_Tx84, axis=0))
        return float(diffs.mean())
    
    def _get_allowed_names(self):
        """Get allowed class names based on mode"""
        if self.mode == "letters":
            return self.LETTER_SET
        elif self.mode == "numbers":
            return self.NUMBER_SET
        return None  # auto mode
    
    def _mask_probs(self, probs, label_names):
        """Filter probabilities based on mode"""
        allowed_set = self._get_allowed_names()
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
    
    def process_frame(self, frame: np.ndarray) -> Tuple[Optional[np.ndarray], Optional[float], float]:
        """Process frame with letters-specific logic"""
        model_info = self.get_model_info()
        current_model = model_info["model"]
        current_labels = model_info["label_names"]
        current_n_features = model_info["n_features"]
        
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb)
        
        feat84, hand_confidence = self._feat84_from_results(results)
        pred_proba = None
        motion_level = None
        
        if feat84 is not None:
            self.feat84_buffer.append(feat84)
            
            if current_n_features == 336 and len(self.feat84_buffer) >= self.MIN_SEQ_FOR_PRED:
                seq = np.stack(list(self.feat84_buffer)[-self.SEQ_WINDOW:], axis=0)
                motion_level = self._window_motion_level(seq)
                
                X336 = self._to_336_from_seq(seq).reshape(1, -1)
                
                if hasattr(current_model, "predict_proba"):
                    pred_proba = current_model.predict_proba(X336)[0]
                    
                    # Gate J/Z without motion
                    if motion_level < self.MOTION_THRESHOLD:
                        for i, name in enumerate(current_labels):
                            if name in self.MOTION_ONLY_CLASSES:
                                pred_proba[i] = 0.0
                        s = pred_proba.sum()
                        if s > 0:
                            pred_proba /= s
                    
                    # Apply mode filtering
                    pred_proba = self._mask_probs(pred_proba, current_labels)
                    self.proba_buffer.append(pred_proba)
        else:
            self.feat84_buffer.clear()
        
        return pred_proba, motion_level, hand_confidence
    
    def close(self):
        self.hands.close()


# ============================================================================
# GESTURES SESSION - Matches training in inference_live_phrases.py (Document 5)
# ============================================================================

class GesturesSessionState:
    """Gestures/Phrases model - matches training feature extraction exactly"""
    
    # Constants specific to gestures training
    SEQ_WINDOW = 30
    MIN_SEQ_FOR_PRED = 24  # More context for gestures
    PREDICT_STRIDE = 5
    MIN_CONFIDENCE = 0.31
    STABLE_N = 8
    
    # Detection settings
    DETECT_WIDTH = 960  # Higher resolution for better fingertip detection
    
    def __init__(self, loaded_models: Dict[str, Any] = None):
        self.model_name = "gestures"
        self.loaded_models = loaded_models or {}
        self.hands = self._init_hands()
        self.feat84_buffer = deque(maxlen=self.SEQ_WINDOW)
        self.proba_buffer = deque(maxlen=8)
        self.stable_idx = None
        self.stable_run = 0
        self.last_ts = 0.0
        self.frame_count = 0
    
    def _init_hands(self):
        """Gestures-specific MediaPipe configuration"""
        return mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            model_complexity=0,  # Lightweight for speed
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    
    def get_model_info(self):
        if self.model_name not in self.loaded_models:
            raise RuntimeError(f"Model '{self.model_name}' not loaded")
        return self.loaded_models[self.model_name]
    
    def _hand_landmarks_xy(self, results):
        """Gestures-specific feature extraction: wrist-centered, palm-scaled"""
        left = None
        right = None
        
        if results.multi_hand_landmarks and results.multi_handedness:
            for lm, hd in zip(results.multi_hand_landmarks, results.multi_handedness):
                label = hd.classification[0].label.lower()
                xy = np.array([(pt.x, pt.y) for pt in lm.landmark], dtype=np.float32)
                
                # Wrist-center normalization
                wrist = xy[0]
                xy -= wrist
                
                # Palm-scale normalization
                palm = np.linalg.norm(xy[9]) + 1e-6  # wrist to middle MCP
                xy /= palm
                
                if label == "left":
                    left = xy
                else:
                    right = xy
        
        def pack(xy):
            return xy.reshape(-1) if xy is not None else np.zeros(42, dtype=np.float32)
        
        left_vec = pack(left)
        right_vec = pack(right)
        feat84 = np.concatenate([left_vec, right_vec], axis=0)
        
        # Hand confidence
        hand_conf = 1.0 if (left is not None or right is not None) else 0.0
        
        return feat84, hand_conf
    
    def _to_336_from_seq(self, seq_Tx84):
        """Gestures-specific 336D construction"""
        M = seq_Tx84
        mu = M.mean(axis=0)
        sd = M.std(axis=0) + 1e-6
        dM = np.diff(M, axis=0)
        dmu = dM.mean(axis=0)
        dsd = dM.std(axis=0) + 1e-6
        return np.concatenate([mu, sd, dmu, dsd], axis=0).astype(np.float32)
    
    def process_frame(self, frame: np.ndarray) -> Tuple[Optional[np.ndarray], Optional[float], float]:
        """Process frame with gestures-specific logic"""
        model_info = self.get_model_info()
        current_model = model_info["model"]
        current_n_features = model_info["n_features"]
        
        # Resize for detection (gestures use higher res)
        h, w = frame.shape[:2]
        scale = self.DETECT_WIDTH / float(w)
        small = cv2.resize(frame, (self.DETECT_WIDTH, int(h * scale)), interpolation=cv2.INTER_AREA)
        
        rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb)
        
        feat84, hand_confidence = self._hand_landmarks_xy(results)
        pred_proba = None
        motion_level = None
        
        if feat84 is not None and np.any(feat84 != 0):
            self.feat84_buffer.append(feat84)
        else:
            self.feat84_buffer.clear()
        
        self.frame_count += 1
        
        # Predict every PREDICT_STRIDE frames for dense coverage
        if (len(self.feat84_buffer) >= self.MIN_SEQ_FOR_PRED and 
            self.frame_count % self.PREDICT_STRIDE == 0):
            
            seq = np.stack(list(self.feat84_buffer)[-self.SEQ_WINDOW:], axis=0)
            
            if current_n_features == 336:
                X336 = self._to_336_from_seq(seq).reshape(1, -1)
                
                if hasattr(current_model, "predict_proba"):
                    pred_proba = current_model.predict_proba(X336)[0]
                    self.proba_buffer.append(pred_proba)
        
        return pred_proba, motion_level, hand_confidence
    
    def close(self):
        self.hands.close()