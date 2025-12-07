import React from "react";
import { Target, TrendingUp, Trophy } from "lucide-react";
import type { AttemptResult, ClassData } from "../types";

interface StatsOverlayProps {
    attemptResults: AttemptResult[];
    currentAccuracy: number;
    classData: ClassData;
    currentAttempt: number;
    maxAttempts: number;
}

export const StatsOverlay: React.FC<StatsOverlayProps> = ({
    attemptResults,
    currentAccuracy,
    classData,
    currentAttempt,
    maxAttempts,
}) => {
    if (attemptResults.length === 0) return null;

    return (
        <div
            className="position-absolute p-3 rounded-5 shadow-lg"
            style={{
                bottom: "20px",
                right: "20px",
                left: "20px",
                background: "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.45)",
                zIndex: 100
            }}
        >
            <div className="row text-center">
                <div className="col-4">
                    <div className="d-flex flex-column align-items-center">
                        <Target size={20} className="mb-1 text-info" />
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                            {currentAccuracy.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Accuracy</div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex flex-column align-items-center">
                        <TrendingUp size={20} className="mb-1 text-warning" />
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                            {attemptResults.filter(r => r.correct).length}/{attemptResults.length}
                        </div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Correct</div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="d-flex flex-column align-items-center">
                        <Trophy size={20} className="mb-1 text-success" />
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                            {classData?.passing_accuracy}%
                        </div>
                        <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>To Pass</div>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div
                    className="progress"
                    style={{ height: "6px", background: "rgba(255, 255, 255, 0.1)" }}
                >
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            width: `${Math.min(currentAccuracy, 100)}%`,
                            background:
                                currentAccuracy >= (classData?.passing_accuracy || 0)
                                    ? "#4caf50"
                                    : "#45caff",
                            transition: "width 0.3s ease",
                        }}
                    />
                </div>
                <div className="text-center mt-2" style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {currentAttempt < maxAttempts
                        ? `${maxAttempts - currentAttempt} attempts remaining`
                        : currentAccuracy >= (classData?.passing_accuracy || 0)
                            ? "🎉 You passed!"
                            : `Need ${((classData?.passing_accuracy || 0) - currentAccuracy).toFixed(1)}% more`}
                </div>
            </div>

            {/* Attempts History (Compact) */}
            <div className="mt-3">
                <h6 className="mb-2" style={{ fontSize: "0.9rem" }}>History:</h6>
                <div style={{ maxHeight: "120px", overflowY: "auto" }} className="custom-scrollbar">
                    {attemptResults.map((result, idx) => (
                        <div
                            key={idx}
                            className={`px-2 py-1 mb-1 rounded d-flex justify-content-between align-items-center ${result.correct ? 'bg-success bg-opacity-25' : 'bg-danger bg-opacity-25'
                                }`}
                            style={{ fontSize: "0.8rem" }}
                        >
                            <span>
                                <strong>#{idx + 1}:</strong> {result.prediction === "none" ? "No sign" : result.prediction}
                            </span>
                            <span>
                                {result.prediction !== "none" && `${(result.confidence * 100).toFixed(0)}% `}
                                {result.correct ? '✅' : '❌'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
