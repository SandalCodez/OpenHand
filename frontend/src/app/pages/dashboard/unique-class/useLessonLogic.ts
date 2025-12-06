import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ClassData, LessonsResponse, AslResult, AttemptResult } from "./types";

export function useLessonLogic() {
    const params = useParams<{ id?: string }>();
    const id: string | null = params.id ?? null;
    const navigate = useNavigate();

    const [classData, setClassData] = useState<ClassData | null>(null);
    const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
    const [nextLessonId, setNextLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Attempt-based recording system
    const [currentAttempt, setCurrentAttempt] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
    const [attemptResults, setAttemptResults] = useState<AttemptResult[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
    const [hasPassedThisSession, setHasPassedThisSession] = useState(false);
    const [savingProgress, setSavingProgress] = useState(false);
    const [progressSaved, setProgressSaved] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Refs
    const lastLessonId = useRef<string | null>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const bestPredictionRef = useRef<{ prediction: string; confidence: number; isCorrect: boolean } | null>(null);

    const MAX_ATTEMPTS = 5;
    const RECORDING_DURATION = 5000; // 5 seconds per attempt

    const targetSign = classData?.lesson_id.split("_")[1] ?? "";

    // Helper to get prev/next lesson IDs
    const getPrevNextLessonIds = (
        currentId: string,
        currentCategory: string,
        lessons: ClassData[]
    ): { prevId: string | null; nextId: string | null } => {
        // Filter by category and active status
        const sameCategoryLessons = lessons.filter(
            l => l.is_active !== false && l.category === currentCategory
        );

        // Sort by order
        const sorted = [...sameCategoryLessons].sort((a, b) => a.order - b.order);

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

        // Clear any active timers
        if (recordingTimerRef.current) {
            clearTimeout(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        // Reset all state
        setCurrentAttempt(0);
        setIsRecording(false);
        setRecordingStartTime(null);
        setAttemptResults([]);
        setTimeRemaining(0);
        setSessionStartTime(Date.now());
        setHasPassedThisSession(false);
        setSavingProgress(false);
        setProgressSaved(false);
        setShowSuccessMessage(false);
        bestPredictionRef.current = null;
    }, [id]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearTimeout(recordingTimerRef.current);
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, []);

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

    const handleStopRecording = useCallback(() => {
        if (!isRecording || !classData) return;

        console.log('⏹️ Stopping recording');
        setIsRecording(false);

        // Clear timers
        if (recordingTimerRef.current) {
            clearTimeout(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setTimeRemaining(0);

        // Evaluate the best prediction from this recording
        const prediction = bestPredictionRef.current;

        if (prediction) {
            const newResult: AttemptResult = {
                correct: prediction.isCorrect,
                confidence: prediction.confidence,
                prediction: prediction.prediction,
            };

            setAttemptResults(prev => {
                const newResults = [...prev, newResult];
                const totalCorrect = newResults.filter(r => r.correct).length;
                const totalAttempts = newResults.length;
                const accuracy = (totalCorrect / totalAttempts) * 100;

                console.log(
                    `Attempt ${totalAttempts}: ${prediction.prediction} (${(prediction.confidence * 100).toFixed(1)}%) - ${prediction.isCorrect ? "✅" : "❌"
                    } - Overall: ${totalCorrect}/${totalAttempts} (${accuracy.toFixed(1)}%)`
                );

                // Save progress if passed after completing all attempts
                if (totalAttempts >= MAX_ATTEMPTS && accuracy >= classData.passing_accuracy) {
                    console.log("🎉 PASSED! Saving progress...");
                    saveProgress(accuracy, totalAttempts);
                }

                return newResults;
            });
            setCurrentAttempt(prev => prev + 1);

        } else {
            console.log("⚠️ No valid prediction captured during recording");
            // Still count as an attempt but with no result
            const noResult: AttemptResult = {
                correct: false,
                confidence: 0,
                prediction: "none",
            };
            setAttemptResults(prev => [...prev, noResult]);
            setCurrentAttempt(prev => prev + 1);
        }

        bestPredictionRef.current = null;
    }, [isRecording, classData, MAX_ATTEMPTS]);

    const handleStartRecording = useCallback(() => {
        if (currentAttempt >= MAX_ATTEMPTS || !classData) return;

        console.log(`📹 Starting attempt ${currentAttempt + 1}/${MAX_ATTEMPTS}`);
        setIsRecording(true);
        setRecordingStartTime(Date.now());
        setTimeRemaining(RECORDING_DURATION / 1000);
        bestPredictionRef.current = null;

        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = Math.max(0, prev - 0.1);
                if (newTime === 0 && countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                }
                return newTime;
            });
        }, 100);

        // Auto-stop after duration
        recordingTimerRef.current = setTimeout(() => {
            handleStopRecording();
        }, RECORDING_DURATION);
    }, [currentAttempt, MAX_ATTEMPTS, classData, handleStopRecording]);

    const handlePrediction = useCallback(
        (result: AslResult) => {
            if (!isRecording || !classData) return;

            const prediction = result.top;
            const confidence = result.conf ?? 0;
            const handConfidence = result.hand_conf ?? 0;

            // Require decent hand detection and prediction confidence
            const hasValidPrediction = prediction && confidence > 0.6 && handConfidence > 0.5;

            if (!hasValidPrediction) return;

            const isCorrect = prediction === targetSign && confidence >= classData.passing_accuracy / 100;

            // Track the best (highest confidence) prediction during this recording
            if (!bestPredictionRef.current || confidence > bestPredictionRef.current.confidence) {
                bestPredictionRef.current = {
                    prediction: prediction!,
                    confidence,
                    isCorrect,
                };
                console.log(`📊 Best prediction updated: ${prediction} (${(confidence * 100).toFixed(1)}%) ${isCorrect ? '✅' : '❌'}`);
            }
        },
        [isRecording, classData, targetSign]
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
    };

    return {
        classData,
        loading,
        error,
        currentAttempt,
        isRecording,
        attemptResults,
        timeRemaining,
        hasPassedThisSession,
        savingProgress,
        progressSaved,
        showSuccessMessage,
        targetSign,
        prevLessonId,
        nextLessonId,
        MAX_ATTEMPTS,
        RECORDING_DURATION,
        handleStartRecording,
        handleStopRecording,
        handlePrediction,
        handleRetry,
        handleNextClass,
        handlePrevClass,
        getCurrentAccuracy,
    };
}
