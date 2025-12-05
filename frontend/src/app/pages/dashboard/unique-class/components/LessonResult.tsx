import React from "react";
import { Trophy, Target } from "lucide-react";
import type { AttemptResult, ClassData } from "../types";

interface LessonResultProps {
    hasPassed: boolean;
    currentAccuracy: number;
    attemptResults: AttemptResult[];
    maxAttempts: number;
    classData: ClassData;
    onRetry: () => void;
}

export const LessonResult: React.FC<LessonResultProps> = ({
    hasPassed,
    currentAccuracy,
    attemptResults,
    maxAttempts,
    classData,
    onRetry,
}) => {
    return (
        <div className="w-100 px-4">
            {hasPassed ? (
                // SUCCESS RESULT
                <div className="alert alert-success p-4 text-center" style={{ fontSize: "1.1rem" }}>
                    <Trophy size={48} className="mb-3 text-success" />
                    <h3 className="mb-3">🎉 Lesson Complete!</h3>
                    <div className="mb-2">
                        <strong>Score: {currentAccuracy.toFixed(1)}%</strong>
                    </div>
                    <div className="text-success">
                        ✅ You passed! Progress saved.
                    </div>
                </div>
            ) : (
                // FAILED RESULT
                <div className="alert alert-primary p-4 rounded-5 text-center" style={{ fontSize: "1.1rem" }}>
                    <Target size={48} className="mb-3 text-warning" />
                    <h3 className="mb-3">Lesson Complete!</h3>
                    <div className="mb-2">
                        You completed <strong>{attemptResults.filter(r => r.correct).length}/{maxAttempts}</strong> attempts correctly
                        (<strong>{currentAccuracy.toFixed(1)}%</strong>).
                    </div>
                    {currentAccuracy < classData.passing_accuracy && (
                        <div className="mb-3 text-muted">
                            You need <strong>{classData.passing_accuracy}%</strong> to pass. Try again!
                        </div>
                    )}
                    <button
                        onClick={onRetry}
                        className="btn btn-warning rounded-4 mt-2"
                        style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                    >
                        Retry Lesson
                    </button>
                </div>
            )}
        </div>
    );
};
