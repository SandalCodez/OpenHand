// UniqueClassPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import AslWebcamSender from "../../../components/AslWebcamSender";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";
import "./UniqueClassPage.css";
import { ChevronRight, ChevronLeft, Trophy, Target, TrendingUp, Play, Square } from "lucide-react";

interface ClassData {
  lesson_id: string;
  title: string;
  image_url?: string;
  category: string;
  difficulty: string;
  passing_accuracy: number;
  gained_XP: number;
  instructions: string;
  order: number;
  is_active?: boolean;
}

interface LessonsResponse {
  lessons: ClassData[];
}

interface AslResult {
  top: string | null;
  conf: number | null;
  hand_conf?: number | null;
}

interface AttemptResult {
  correct: boolean;
  confidence: number;
  prediction: string;
}

function getPrevNextLessonIds(
  currentId: string,
  lessons: ClassData[]
): { prevId: string | null; nextId: string | null } {
  const active = lessons.filter(l => l.is_active !== false);
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
}

export default function UniqueClassPage() {
  const params = useParams<{ id?: string }>();
  const id: string | null = params.id ?? null;
  const navigate = useNavigate();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Attempt-based recording system
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

  // RESET STATS WHEN LESSON CHANGES
  useEffect(() => {
    if (lastLessonId.current === id) {
      console.log("No real lesson change -> not resetting.");
      return;
    }

    console.log("RESETTING BECAUSE NEW ID:", id, " Last ID:", lastLessonId.current);
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

  // Handler used by webcam - tracks best prediction during recording
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

  // Start recording an attempt
  const handleStartRecording = () => {
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
  };

  // Stop recording and evaluate
  const handleStopRecording = () => {
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

      setAttemptResults(prev => [...prev, newResult]);
      setCurrentAttempt(prev => prev + 1);

      const newAttemptResults = [...attemptResults, newResult];
      const totalCorrect = newAttemptResults.filter(r => r.correct).length;
      const totalAttempts = currentAttempt + 1;
      const accuracy = (totalCorrect / totalAttempts) * 100;

      console.log(
        `Attempt ${totalAttempts}: ${prediction.prediction} (${(prediction.confidence * 100).toFixed(1)}%) - ${
          prediction.isCorrect ? "✅" : "❌"
        } - Overall: ${totalCorrect}/${totalAttempts} (${accuracy.toFixed(1)}%)`
      );

      // Save progress if passed after completing all attempts
      if (totalAttempts >= MAX_ATTEMPTS && accuracy >= classData.passing_accuracy) {
        console.log("🎉 PASSED! Saving progress...");
        saveProgress(accuracy, totalAttempts);
      }
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
  };

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

  return (
    <div className="container-fluid unique-class-page">
      <div className="row">
        {/* LEFT SIDE */}
        <div className="col-12 col-lg-6 border border-1 border-light text-white py-2 unique-left">
          <div className="row">
            <div className="col-lg-10">
              {classData && !loading && !error && (
                <div className="MascotAnimationPosition">
                  <div className="mascot-with-bubble">
                    <MainMascotAnimation size={200} />
                    <div className="mascot-bubble">
                      <div className="mascot-bubble-title">
                        How to sign{" "}
                        <span className="badge bg-dark text-white p-2 me-2">{targetSign}</span>
                      </div>
                      <p className="mascot-bubble-text">{classData.instructions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="col-lg-2 align-self-center">
              <div className="mb-3">
                {classData && (
                  <span className="badge bg-success p-2 me-2 rounded-5 custom-badge">
                    {classData.gained_XP} XP
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading && <p>Loading...</p>}
          {error && !loading && <p className="text-danger">{error}</p>}

          {classData && !loading && !error && (
            <>
              <div className="unique-left-main mt-4">
                {classData.image_url ? (
                  <img
                    src={classData.image_url}
                    alt={classData.title}
                    style={{ width: 200, height: 200, objectFit: "contain" }}
                    className="mb-3 grow-shrink p-2"
                  />
                ) : (
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: 120, height: 120, border: "1px dashed #4b5563" }}
                  >
                    <span className="text-secondary small">no image</span>
                  </div>
                )}

                <h1 className="display-5 p-2 mb-2">{classData.title}</h1>

                {/* Recording Control Button */}
                {!hasPassedThisSession && currentAttempt < MAX_ATTEMPTS && (
                  <div className="mb-4">
                    {!isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        className="btn btn-success btn-lg w-100"
                        style={{
                          fontSize: "1.2rem",
                          padding: "1rem",
                          fontWeight: "bold",
                        }}
                      >
                        <Play size={24} className="me-2" />
                        Record Attempt {currentAttempt + 1}/{MAX_ATTEMPTS}
                      </button>
                    ) : (
                      <div>
                        <button
                          onClick={handleStopRecording}
                          className="btn btn-danger btn-lg w-100 mb-3"
                          style={{
                            fontSize: "1.2rem",
                            padding: "1rem",
                            fontWeight: "bold",
                          }}
                        >
                          <Square size={24} className="me-2" />
                          Stop Recording
                        </button>
                        {/* Countdown Timer */}
                        <div className="text-center mb-2">
                          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                            {timeRemaining.toFixed(1)}s
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className="progress-bar bg-danger"
                              role="progressbar"
                              style={{
                                width: `${(timeRemaining / (RECORDING_DURATION / 1000)) * 100}%`,
                                transition: "width 0.1s linear",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Stats Card */}
                {attemptResults.length > 0 && (
                  <div className="mt-4 p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="d-flex flex-column align-items-center">
                          <Target size={24} className="mb-2" />
                          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                            {getCurrentAccuracy().toFixed(1)}%
                          </div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Accuracy</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="d-flex flex-column align-items-center">
                          <TrendingUp size={24} className="mb-2" />
                          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                            {attemptResults.filter(r => r.correct).length}/{attemptResults.length}
                          </div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Correct</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="d-flex flex-column align-items-center">
                          <Trophy size={24} className="mb-2" />
                          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                            {classData.passing_accuracy}%
                          </div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>To Pass</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div
                        className="progress"
                        style={{ height: "8px", background: "rgba(255, 255, 255, 0.2)" }}
                      >
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${Math.min(getCurrentAccuracy(), 100)}%`,
                            background:
                              getCurrentAccuracy() >= classData.passing_accuracy
                                ? "#4caf50"
                                : "#45caff",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <div className="text-center mt-2" style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        {currentAttempt < MAX_ATTEMPTS
                          ? `${MAX_ATTEMPTS - currentAttempt} attempts remaining`
                          : getCurrentAccuracy() >= classData.passing_accuracy
                          ? "🎉 You passed!"
                          : `Need ${(classData.passing_accuracy - getCurrentAccuracy()).toFixed(1)}% more to pass`}
                      </div>
                    </div>

                    {/* Attempts History */}
                    <div className="mt-3">
                      <h6 className="mb-2">Attempt History:</h6>
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {attemptResults.map((result, idx) => (
                          <div
                            key={idx}
                            className={`p-2 mb-2 rounded d-flex justify-content-between align-items-center ${
                              result.correct ? 'bg-success bg-opacity-25' : 'bg-danger bg-opacity-25'
                            }`}
                            style={{ fontSize: "0.9rem" }}
                          >
                            <span>
                              <strong>#{idx + 1}:</strong> {result.prediction === "none" ? "No sign detected" : result.prediction}
                            </span>
                            <span>
                              {result.prediction !== "none" && `${(result.confidence * 100).toFixed(1)}% `}
                              {result.correct ? '✅' : '❌'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Result - Failed */}
                {currentAttempt >= MAX_ATTEMPTS && !hasPassedThisSession && (
                  <div className="alert alert-warning mt-3">
                    <strong>Lesson Complete!</strong>
                    <div className="mt-2">
                      You completed {attemptResults.filter(r => r.correct).length}/{MAX_ATTEMPTS} attempts correctly
                      ({getCurrentAccuracy().toFixed(1)}%).
                    </div>
                    {getCurrentAccuracy() < classData.passing_accuracy && (
                      <div className="mt-2">
                        You need {classData.passing_accuracy}% to pass. Try again!
                      </div>
                    )}
                    <button
                      onClick={handleRetry}
                      className="btn btn-warning mt-3 w-100"
                    >
                      Retry Lesson
                    </button>
                  </div>
                )}

                {/* Success Message */}
                {showSuccessMessage && (
                  <div className="alert alert-success mt-3 d-flex align-items-center" role="alert">
                    <Trophy size={20} className="me-2" />
                    <strong>Progress Saved!</strong> You passed with {getCurrentAccuracy().toFixed(1)}%
                  </div>
                )}

                {savingProgress && (
                  <div className="alert alert-info mt-3" role="alert">
                    Saving your progress...
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="unique-left-buttons d-flex justify-content-between px-4">
                <button
                  className="btn btn-outline-light rounded-pill btn-sm"
                  onClick={handlePrevClass}
                  disabled={!prevLessonId}
                >
                  <ChevronLeft size={14} />
                  Previous Class
                </button>
                <button
                  className="btn btn-outline-light rounded-pill btn-sm"
                  onClick={handleNextClass}
                  disabled={!nextLessonId}
                >
                  {nextLessonId ? (
                    <>
                      Next Class <ChevronRight size={14} />
                    </>
                  ) : (
                    "No more classes"
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border border-1 border-light vh-100 text-white py-5 unique-right">
          <AslWebcamSender 
            wsUrl="ws://localhost:8000/ws" 
            mode="letters" 
            onPrediction={handlePrediction}
          />
        </div>
      </div>
    </div>
  );
}