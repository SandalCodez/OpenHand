import type { AslMode, AslModel } from "../lib/useAslWs";

export const DEFAULT_THRESHOLDS = {
    letters: 0.75,
    numbers: 0.85,
    gestures: 0.80,
    default: 0.70
};

// Start with empty overrides, user can add specific ones here
export const CLASS_THRESHOLDS: Record<string, number> = {
    // Examples:
    "A": 0.60,
    "F": .40,
    "E": .40,
    "G": .40,
    "K": .60,
    "M": .45,
    "N": .50,
    "O": .40,
    "P": .40,
    "S": .45,
    "T": .40,
    "U": .20,
    "W": .55,
    "Z": .35,
    // "5": 0.90,      // Number override
    // "MORE": 0.70    // Gesture override (use the exact name from the UI)
};

export function getPassingThreshold(mode: AslMode, model: AslModel, prediction: string | null): number {
    if (!prediction) return DEFAULT_THRESHOLDS.default;

    // 1. Check for specific class override
    if (CLASS_THRESHOLDS[prediction]) {
        return CLASS_THRESHOLDS[prediction];
    }

    // 2. Check for category default based on model/mode
    if (model === "gestures") {
        return DEFAULT_THRESHOLDS.gestures;
    }

    // For letters/numbers model, check mode
    if (mode === "numbers") {
        return DEFAULT_THRESHOLDS.numbers;
    }

    if (mode === "letters") {
        return DEFAULT_THRESHOLDS.letters;
    }

    return DEFAULT_THRESHOLDS.default;
}
