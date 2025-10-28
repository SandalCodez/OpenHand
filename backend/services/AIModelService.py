
from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Tuple, Deque
from pathlib import Path
from collections import deque
import json, threading
import numpy as np
import pickle

router = APIRouter()


# ---------- Paths ----------
MODEL_DIR = Path(__file__).resolve().parents[1] / "model"
CANDIDATES = ["model_rf_336_meta.p", "model_rf_336.p", "model_rf_336.pkl"]
LABELS_TXT = MODEL_DIR / "labels.txt"
META_PICKLE = MODEL_DIR / "model_rf_336_meta.p"

ESTIMATOR_NAMES = ["model_rf_336.pkl", "model_rf_336.p"]
META_NAMES      = ["model_rf_336_meta.p", "model_rf_336_meta.pkl"]

# ---------- Runtime config ----------
SMOOTH_K = 7
SEQ_WINDOW = 30
MIN_SEQ_FOR_PRED = 8
MIN_CONFIDENCE = 0.60
STABLE_N = 6

LETTER_SET = set(list("ABCDEFGHIKLMNOPQRSTUVWXY") + ["J", "Z"])
NUMBER_SET = set(list("0123456789"))

# ---------- Globals ----------
_model_lock = threading.Lock()
_MODEL = None            # sklearn estimator
_LABELS: Optional[list] = None
_NF: Optional[int] = None

def _is_estimator(obj) -> bool:
    return hasattr(obj, "predict") or hasattr(obj, "predict_proba")

def _load_pickle(path: Path):
    with open(path, "rb") as f:
        return pickle.load(f)

# ---------- Utils ----------
def _read_labels_txt() -> Optional[list]:
    if LABELS_TXT.exists():
        lines = [ln.strip() for ln in LABELS_TXT.read_text(encoding="utf-8").splitlines() if ln.strip()]
        return lines or None
    return None

def _classes_from_estimator(model) -> Optional[list]:
    cls = list(getattr(model, "classes_", []))
    return [str(c) for c in cls] if cls else None

def _infer_nf_from_estimator(model) -> Optional[int]:
    for attr in ("n_features_in_", "n_features_"):
        nf = getattr(model, attr, None)
        if nf: return int(nf)
    ests = getattr(model, "estimators_", None)
    if ests:
        for est in ests:
            nf = getattr(est, "n_features_in_", None) or getattr(est, "n_features_", None)
            if nf: return int(nf)
    steps = getattr(model, "steps", None)
    if steps:
        last = steps[-1][1]
        nf = getattr(last, "n_features_in_", None) or getattr(last, "n_features_", None)
        if nf: return int(nf)
    return None

def _guess_nf_from_filename(path: Path) -> Optional[int]:
    name = path.name.lower()
    if "336" in name: return 336
    if "84"  in name: return 84
    return None

def _safe_proba(model, X: np.ndarray) -> np.ndarray:
    if hasattr(model, "predict_proba"):
        return np.asarray(model.predict_proba(X)[0], dtype=float)
    pred = model.predict(X)[0]
    classes = list(getattr(model, "classes_", []))
    if classes:
        vec = np.zeros(len(classes), dtype=float)
        try:
            vec[classes.index(pred)] = 1.0
        except ValueError:
            vec[0] = 1.0
        return vec
    vec = np.zeros(26, dtype=float); vec[0] = 1.0
    return vec

def _probe_nf(model, candidates=(336, 84)) -> Optional[int]:
    for nf in candidates:
        try:
            _ = _safe_proba(model, np.zeros((1, nf), dtype=np.float32))
            return nf
        except Exception:
            continue
    return None

def _load_model() -> Tuple[object, list, int]:
    """Return (estimator, labels, n_features)."""
    global _MODEL, _LABELS, _NF  # ← must be the first statement in the function

    if _MODEL is not None:
        return _MODEL, _LABELS, _NF

    with _model_lock:
        if _MODEL is not None:
            return _MODEL, _LABELS, _NF

        # helpers
        def is_estimator(x): return hasattr(x, "predict") or hasattr(x, "predict_proba")

        def safe_proba(m, X):
            if hasattr(m, "predict_proba"):
                return np.asarray(m.predict_proba(X)[0], dtype=float)
            pred = m.predict(X)[0]
            cls = list(getattr(m, "classes_", []))
            if cls:
                v = np.zeros(len(cls), dtype=float)
                try: v[cls.index(pred)] = 1.0
                except ValueError: v[0] = 1.0
                return v
            v = np.zeros(26, dtype=float); v[0] = 1.0
            return v

        def infer_nf(m):
            for attr in ("n_features_in_", "n_features_"):
                nf = getattr(m, attr, None)
                if nf: return int(nf)
            ests = getattr(m, "estimators_", None)
            if ests:
                for e in ests:
                    nf = getattr(e, "n_features_in_", None) or getattr(e, "n_features_", None)
                    if nf: return int(nf)
            steps = getattr(m, "steps", None)
            if steps:
                last = steps[-1][1]
                nf = getattr(last, "n_features_in_", None) or getattr(last, "n_features_", None)
                if nf: return int(nf)
            return None

        def guess_nf_from_name(p: Path):
            n = p.name.lower()
            if "336" in n: return 336
            if "84"  in n: return 84
            return None

        def probe_nf(m, candidates=(336, 84)):
            for nf in candidates:
                try:
                    _ = safe_proba(m, np.zeros((1, nf), dtype=np.float32))
                    return nf
                except Exception:
                    continue
            return None

        # labels.txt if present
        labels_txt = None
        if LABELS_TXT.exists():
            ls = [ln.strip() for ln in LABELS_TXT.read_text(encoding="utf-8").splitlines() if ln.strip()]
            if ls: labels_txt = ls

        last_err = None
        candidate_names = CANDIDATES + [p.name for p in MODEL_DIR.glob("*.p*")]

        for name in candidate_names:
            p = MODEL_DIR / name
            if not p.exists():
                continue
            try:
                with open(p, "rb") as f:
                    obj = pickle.load(f)

                estimator = None
                meta_classes = None
                meta_nf = None

                if isinstance(obj, dict):
                    if is_estimator(obj.get("model")):
                        estimator = obj["model"]
                    if isinstance(obj.get("classes"), (list, tuple)) and obj["classes"]:
                        meta_classes = [str(c) for c in obj["classes"]]
                    if obj.get("n_features"):
                        meta_nf = int(obj["n_features"])
                elif is_estimator(obj):
                    estimator = obj

                if not estimator:
                    continue

                labels = labels_txt or meta_classes
                if not labels:
                    cls = list(getattr(estimator, "classes_", []))
                    labels = [str(c) for c in cls] if cls else None

                nf = meta_nf or infer_nf(estimator) or guess_nf_from_name(p) or probe_nf(estimator)
                if not nf:
                    raise RuntimeError("cannot determine n_features (expected 84 or 336)")

                if not labels:
                    k = len(safe_proba(estimator, np.zeros((1, nf), dtype=np.float32)))
                    LETTERS = list("ABCDEFGHIKLMNOPQRSTUVWXY") + ["J", "Z"]
                    NUMS = list("0123456789")
                    BOTH = LETTERS + NUMS
                    if   k == len(BOTH):    labels = BOTH
                    elif k == len(LETTERS): labels = LETTERS
                    elif k == len(NUMS):    labels = NUMS
                    else:                   labels = [str(i) for i in range(k)]

                _MODEL, _LABELS, _NF = estimator, labels, int(nf)
                print(f"[MODEL] Loaded {name} | n_features={_NF} | classes={len(_LABELS)}")
                return _MODEL, _LABELS, _NF

            except Exception as e:
                last_err = e
                continue

        raise RuntimeError(f"Failed to load model from {MODEL_DIR}. Last error: {last_err}")
# ---------- Feature building ----------
def _order_hands(lm_list: List[List[dict]]) -> List[List[dict]]:
    if not lm_list: return []
    def mean_x(hand): return sum(p["x"] for p in hand) / max(len(hand), 1)
    return sorted(lm_list, key=mean_x)[:2]

def _feat84_from_payload(hands: List[List[dict]]) -> Optional[np.ndarray]:
    ordered = _order_hands(hands)
    if not ordered: return None
    xs = [p["x"] for h in ordered for p in h]
    ys = [p["y"] for h in ordered for p in h]
    min_x = min(xs) if xs else 0.0
    min_y = min(ys) if ys else 0.0
    feat = []
    for slot in range(2):
        if slot < len(ordered):
            h = ordered[slot]
            first21 = (h + [{"x":0,"y":0,"z":0}] * 21)[:21]
            for p in first21:
                feat.extend([p["x"] - min_x, p["y"] - min_y])
        else:
            feat.extend([0.0] * 42)
    return np.asarray(feat, dtype=np.float32)

def _to_336_from_seq(seq_Tx84: np.ndarray) -> np.ndarray:
    T = seq_Tx84.shape[0]
    mean = seq_Tx84.mean(axis=0)
    std  = seq_Tx84.std(axis=0)
    last_first = seq_Tx84[-1] - seq_Tx84[0] if T > 1 else np.zeros_like(mean)
    if T >= 2:
        diffs = np.diff(seq_Tx84, axis=0)
        mad = np.mean(np.abs(diffs), axis=0)
    else:
        mad = np.zeros_like(mean)
    return np.concatenate([mean, std, last_first, mad], axis=0).astype(np.float32)

def _mask_probs(probs: np.ndarray, labels: list, allowed: Optional[set]) -> np.ndarray:
    if allowed is None: return probs
    masked = probs.copy()
    for i, name in enumerate(labels):
        if name not in allowed: masked[i] = 0.0
    s = masked.sum()
    return masked/s if s>0 else masked

def _allowed_set(mode: Optional[str]) -> Optional[set]:
    if not mode: return None
    m = mode.lower()
    if m == "letters": return LETTER_SET
    if m == "numbers": return NUMBER_SET
    return None

# ---------- Schemas ----------
class FramePayload(BaseModel):
    target_label: Optional[str] = None
    mode: Optional[str] = None
    hands: List[List[dict]] = []

# ---------- WebSocket ----------
@router.websocket("/ws/predict")
async def ws_predict(ws: WebSocket):
    await ws.accept()

    try:
        model, labels, n_features = _load_model()
    except Exception as e:
        await ws.send_text(json.dumps({"error": f"Model load failed: {e}"}))
        await ws.close()
        return

    feat84_buf: Deque[np.ndarray] = deque(maxlen=max(SEQ_WINDOW, SMOOTH_K))
    proba_buf: Deque[np.ndarray] = deque(maxlen=8)
    stable_idx = None
    stable_run = 0
    frames_seen = 0

    target_label: Optional[str] = None
    target_idx: Optional[int] = None
    mode: Optional[str] = "letters"
    allowed = _allowed_set(mode)

    await ws.send_text(json.dumps({"ready": True}))

    try:
        while True:
            raw = await ws.receive_text()
            try:
                payload = FramePayload.model_validate_json(raw)
            except Exception:
                payload = FramePayload(**json.loads(raw))

            if payload.target_label is not None:
                target_label = str(payload.target_label)
                target_idx = labels.index(target_label) if target_label in labels else None

            if payload.mode is not None:
                mode = payload.mode
                allowed = _allowed_set(mode)

            hands = payload.hands or []
            frames_seen += 1

            feat84 = _feat84_from_payload(hands)
            proba_display = None

            if feat84 is None:
                feat84_buf.clear()
            else:
                feat84_buf.append(feat84)

                pred_proba = None
                if n_features == 84 and len(feat84_buf) >= SMOOTH_K:
                    X = np.mean(np.stack(list(feat84_buf)[-SMOOTH_K:]), axis=0, dtype=np.float32).reshape(1, -1)
                    pred_proba = _safe_proba(model, X)
                elif n_features == 336 and len(feat84_buf) >= MIN_SEQ_FOR_PRED:
                    seq = np.stack(list(feat84_buf)[-SEQ_WINDOW:], axis=0)
                    X336 = _to_336_from_seq(seq).reshape(1, -1)
                    pred_proba = _safe_proba(model, X336)

                if pred_proba is not None:
                    pred_proba = _mask_probs(pred_proba, labels, allowed)
                    proba_buf.append(pred_proba)

                if proba_buf:
                    proba_display = np.mean(np.stack(proba_buf, axis=0), axis=0)

            resp = {
                "frames_seen": frames_seen,
                "predicted_label": None,
                "target": target_label,
                "target_confidence": 0.0,
                "success": False,
            }

            if proba_display is not None and len(proba_display) > 0:
                top_idx = int(np.argmax(proba_display))
                pred_label = labels[top_idx] if top_idx < len(labels) else str(top_idx)
                resp["predicted_label"] = pred_label

                if stable_idx == top_idx:
                    stable_run += 1
                else:
                    stable_idx = top_idx
                    stable_run = 1

                if target_idx is not None and 0 <= target_idx < len(proba_display):
                    tconf = float(proba_display[target_idx])
                    resp["target_confidence"] = tconf
                    if stable_run >= STABLE_N and tconf >= MIN_CONFIDENCE:
                        resp["success"] = True

            await ws.send_text(json.dumps(resp))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await ws.send_text(json.dumps({"error": str(e)}))
        finally:
            await ws.close()

# ---------- HTTP health (under /api because of router prefix) ----------
@router.get("/model/health")
def model_health():
    try:
        m, labels, nf = _load_model()
        return {"ok": True, "n_features": nf, "num_classes": len(labels), "labels_head": labels[:5]}
    except Exception as e:
        return {"ok": False, "error": str(e)}
