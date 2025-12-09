import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ClassData, LessonsResponse, AslResult, AttemptResult } from "./types";
import { getPassingThreshold } from "../../../../config/thresholds";
import type { AslMode, AslModel } from "../../../../lib/useAslWs";

export function useLessonLogic() {
    const params = useParams<{ id?: string }>();
    const id: string | null = params.id ?? null;
    const navigate = useNavigate();

    const [classData, setClassData] = useState<ClassData | null>(null);
    const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auto-Pass System
    const [currentAttempt, setCurrentAttempt] = useState(0); // Tracks successful passes
    const [attemptResults, setAttemptResults] = useState<AttemptResult[]>([]);

    // Cooldown Ref
    const lastPassTimeRef = useRef<number>(0);
    const COOLDOWN_MS = 2000;

    const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
    const [hasPassedThisSession, setHasPassedThisSession] = useState(false);
    const [savingProgress, setSavingProgress] = useState(false);
    const [progressSaved, setProgressSaved] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Refs
    const lastLessonId = useRef<string | null>(null);
    const bestPredictionRef = useRef<{ prediction: string; confidence: number; isCorrect: boolean } | null>(null);

    const MAX_ATTEMPTS = 5; // Goal: 5 Successful repetitions

    const targetSign = classData?.lesson_id.split("_").slice(1).join(" ") ?? "";

    // Helper to get prev/next lesson IDs
    const getPrevNextLessonIds = (
        currentId: string,
        category: string,
        lessons: ClassData[]
    ): { prevId: string | null; nextId: string | null } => {
        const active = lessons.filter(l => l.is_active !== false && l.category === category);
        const sorted = [...active].sort((a, b) => a.order - b.order);

        const currentIndex = sorted.findIndex(l => l.lesson_id === currentId);
        if (currentIndex === -1) {
            return { prevId: null, nextId: null };
        }

        const prev = sorted[currentIndex - 1];
        const next = sorted[currentIndex + 1];

        return {
            prevId: prev ? prev.lesson_id : null,
            nextId: next ? next.lesson_id : null,
        };
    };

    // RESET STATS WHEN LESSON CHANGES
    useEffect(() => {
        if (lastLessonId.current === id) {
            return;
        }

        lastLessonId.current = id;

        // Reset all state
        setCurrentAttempt(0);
        setAttemptResults([]);
        setSessionStartTime(Date.now());
        setHasPassedThisSession(false);
        setSavingProgress(false);
        setProgressSaved(false);
        setShowSuccessMessage(false);
        bestPredictionRef.current = null;
        lastPassTimeRef.current = 0;
    }, [id]);

    // Fetch class + all lessons for prev/next
    useEffect(() => {
        if (!id) {
            setClassData(null);
            setPrevLessonId(null);
            setNextLessonId(null);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [lessonRes, allRes] = await Promise.all([
                    fetch(`http://localhost:8000/api/lessons/${id}`),
                    fetch("http://localhost:8000/api/lessons/all"),
                ]);

                if (!lessonRes.ok) {
                    throw new Error(`Failed to fetch lesson (${lessonRes.status})`);
                }

                const lesson = (await lessonRes.json()) as ClassData;
                setClassData(lesson);

                if (allRes.ok) {
                    const allData = (await allRes.json()) as LessonsResponse;
                    const { prevId, nextId } = getPrevNextLessonIds(
                        lesson.lesson_id,
                        lesson.category,
                        allData.lessons
                    );
                    setPrevLessonId(prevId);
                    setNextLessonId(nextId);
                } else {
                    setPrevLessonId(null);
                    setNextLessonId(null);
                }
            } catch (err: any) {
                console.error("Error fetching class data:", err);
                setError(err?.message ?? "Failed to load class");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const saveProgress = async (accuracy: number, totalAttempts: number) => {
        if (!classData || hasPassedThisSession || savingProgress) {
            return;
        }

        setHasPassedThisSession(true);
        setSavingProgress(true);

        try {
            const duration = Math.floor((Date.now() - sessionStartTime) / 1000);

            const payload = {
                lesson_id: classData.lesson_id,
                score: accuracy,
                accuracy: accuracy,
                duration,
            };

            const response = await fetch("http://localhost:8000/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to save progress");
            }

            const result = await response.json();
            console.log("✅ Progress saved:", result);

            setProgressSaved(true);
            setShowSuccessMessage(true);

            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
        } catch (err) {
            console.error("Failed to save progress:", err);
            setError(err instanceof Error ? err.message : "Failed to save progress");
            setHasPassedThisSession(false);
        } finally {
            setSavingProgress(false);
        }
    };

    const handlePrediction = useCallback(
        (result: { top: string | null; conf: number | null; hand_conf?: number | null }) => {
            if (!classData || hasPassedThisSession) return;
            // Removed isRecording check - always monitoring

            const prediction = result.top;
            const confidence = result.conf ?? 0;
            const handConfidence = result.hand_conf ?? 0;

            const hasValidPrediction = prediction && confidence > 0 && handConfidence > 0.5;

            if (!hasValidPrediction) return;

            // Determine mode/model to get the correct threshold
            const isNumbers = classData.category === "numbers" || /^\d+$/.test(targetSign);
            const isGestures = classData.category === "gesture" || classData.category === "gestures" || classData.lesson_id.startsWith("gesture");

            const mode: AslMode = isNumbers ? "numbers" : "letters"; // gestures also fall back to letters mode usually but model is key
            const model: AslModel = isGestures ? "gestures" : "letters";

            const threshold = getPassingThreshold(mode, model, prediction);

            // Check correctness: Must match target AND meet threshold
            const matchesTarget = prediction!.toLowerCase() === targetSign.toLowerCase();
            const meetsThreshold = confidence >= threshold;
            const isCorrect = matchesTarget && meetsThreshold;

            const now = Date.now();

            // AUTO-PASS LOGIC
            // If Correct AND (Cooldown is over OR First attempt)
            if (isCorrect && (now - lastPassTimeRef.current > COOLDOWN_MS)) {
                console.log(`✅ Auto-Pass triggered! ${prediction} (${confidence.toFixed(2)})`);

                lastPassTimeRef.current = now;

                const newResult: AttemptResult = {
                    correct: true,
                    confidence: confidence,
                    prediction: prediction!,
                };

                setAttemptResults(prev => {
                    const newResults = [...prev, newResult];
                    const successes = newResults.filter(r => r.correct).length;

                    if (successes >= MAX_ATTEMPTS) {
                        console.log("🎉 ALL REPS COMPLETED! Saving progress...");
                        // 100% accuracy for completion
                        saveProgress(100, MAX_ATTEMPTS);
                    }

                    return newResults;
                });
                setCurrentAttempt(prev => prev + 1);
            }
        },
        [classData, targetSign, hasPassedThisSession, MAX_ATTEMPTS]
    );

    const handleNextClass = () => {
        if (nextLessonId) navigate(`/dashboard/UniqueClass/${nextLessonId}`);
    };

    const handlePrevClass = () => {
        if (prevLessonId) navigate(`/dashboard/UniqueClass/${prevLessonId}`);
    };

    const getCurrentAccuracy = () => {
        if (attemptResults.length === 0) return 0;
        const correct = attemptResults.filter(r => r.correct).length;
        return (correct / attemptResults.length) * 100;
    };

    const handleRetry = () => {
        console.log("🔄 Retrying lesson...");
        setCurrentAttempt(0);
        setAttemptResults([]);
        setHasPassedThisSession(false);
        setProgressSaved(false);
        setShowSuccessMessage(false);
        setSessionStartTime(Date.now());
        bestPredictionRef.current = null;
        lastPassTimeRef.current = 0;
    };

    return {
        classData,
        loading,
        error,
        currentAttempt, // Now represents successes
        attemptResults,
        hasPassedThisSession,
        savingProgress,
        progressSaved,
        showSuccessMessage,
        targetSign,
        prevLessonId,
        nextLessonId,
        MAX_ATTEMPTS,
        handlePrediction,
        handleRetry,
        handleNextClass,
        handlePrevClass,
        getCurrentAccuracy,
    };
}
