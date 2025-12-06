// UniqueClassPage.tsx
import AslWebcamSender from "../../../components/AslWebcamSender";
import "./UniqueClassPage.css";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useLessonLogic } from "./unique-class/useLessonLogic";
import { LessonInfo } from "./unique-class/components/LessonInfo";
import { LessonResult } from "./unique-class/components/LessonResult";
import { RecordingControls } from "./unique-class/components/RecordingControls";
import { StatsOverlay } from "./unique-class/components/StatsOverlay";

export default function UniqueClassPage() {
  const {
    classData,
    loading,
    error,
    currentAttempt,
    isRecording,
    attemptResults,
    timeRemaining,
    hasPassedThisSession,
    savingProgress,
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
  } = useLessonLogic();

  return (
    <div className="container-fluid unique-class-page">
      <div className="row">
        {/* LEFT SIDE */}
        <div className="col-12 col-lg-6 border border-1 border-secondary text-white py-2 unique-left">
          {loading && <p>Loading...</p>}
          {error && !loading && <p className="text-danger">{error}</p>}

          {classData && !loading && !error && (
            <>
              {/* Lesson Info (Mascot & Instructions) */}
              <LessonInfo classData={classData} targetSign={targetSign} />

              <hr className="border-secondary my-2 w-75 mx-auto opacity-25" />

              <div className="unique-left-main mt-1">
                {/* CONDITIONAL: Show either Active Lesson UI or Result UI */}
                {currentAttempt >= MAX_ATTEMPTS || hasPassedThisSession ? (
                  <LessonResult
                    hasPassed={hasPassedThisSession}
                    currentAccuracy={getCurrentAccuracy()}
                    attemptResults={attemptResults}
                    maxAttempts={MAX_ATTEMPTS}
                    classData={classData}
                    onRetry={handleRetry}
                  />
                ) : (
                  // ACTIVE LESSON STATE - Normal image + controls
                  <>
                    {classData.image_url ? (
                      <div
                        className={`mb-1 p-1 rounded-4 ${(classData.category === "gesture" || classData.lesson_id.startsWith("gesture")) ? "overflow-hidden w-100" : "border border-secondary d-flex justify-content-center align-items-center"
                          }`}
                        style={{ maxHeight: (classData.category === "gesture" || classData.lesson_id.startsWith("gesture")) ? "55vh" : "25vh", maxWidth: "100%" }}
                      >
                        <img
                          src={classData.image_url}
                          alt={classData.title}
                          style={{
                            width: (classData.category === "gesture" || classData.lesson_id.startsWith("gesture")) ? "100%" : "auto",
                            height: (classData.category === "gesture" || classData.lesson_id.startsWith("gesture")) ? "100%" : "auto",
                            maxHeight: (classData.category === "gesture" || classData.lesson_id.startsWith("gesture")) ? "55vh" : "25vh",
                            maxWidth: "100%",
                            objectFit: "contain",
                            objectPosition: "center"
                          }}
                          className={(classData.category === "gesture" || classData.lesson_id.startsWith("gesture")) ? "" : "grow-shrink"}
                        />
                      </div>
                    ) : (
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2"
                        style={{ width: 100, height: 100, border: "1px dashed #4b5563" }}
                      >
                        <span className="text-secondary small">no image</span>
                      </div>
                    )}

                    <h1 className="h2 mb-1">{classData.title}</h1>

                    {/* Recording Control Button */}
                    <RecordingControls
                      isRecording={isRecording}
                      currentAttempt={currentAttempt}
                      maxAttempts={MAX_ATTEMPTS}
                      timeRemaining={timeRemaining}
                      recordingDuration={RECORDING_DURATION}
                      onStartRecording={handleStartRecording}
                      onStopRecording={handleStopRecording}
                    />
                  </>
                )}

                {/* Saving Progress Indicator (always show when saving) */}
                {savingProgress && (
                  <div className="alert alert-info mt-3" role="alert">
                    Saving your progress...
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="unique-left-buttons d-flex justify-content-between px-4 align-items-center">
                <button
                  className="btn btn-light fw-bold px-3 rounded-pill shadow-sm d-flex align-items-center gap-2"
                  onClick={handlePrevClass}
                  disabled={!prevLessonId}
                >
                  <ChevronLeft size={20} />
                  Previous Class
                </button>
                <button
                  className="btn btn-light fw-bold px-3 rounded-pill shadow-sm d-flex align-items-center gap-2"
                  onClick={handleNextClass}
                  disabled={!nextLessonId}
                >
                  {nextLessonId ? (
                    <>
                      Next Class <ChevronRight size={20} />
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
        <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border border-1 border-secondary vh-100 text-white py-5 unique-right position-relative">
          <AslWebcamSender
            wsUrl="ws://localhost:8000/ws"
            mode="letters"
            model={
              (classData?.category === "gesture" || classData?.lesson_id.startsWith("gesture"))
                ? "gestures"
                : "letters"
            }
            onPrediction={handlePrediction}
          />

          {/* Floating Stats Overlay */}
          {classData && (
            <StatsOverlay
              attemptResults={attemptResults}
              currentAccuracy={getCurrentAccuracy()}
              classData={classData}
              currentAttempt={currentAttempt}
              maxAttempts={MAX_ATTEMPTS}
            />
          )}
        </div>
      </div>
    </div>
  );
}