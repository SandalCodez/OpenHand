import React from "react";
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
    currentAttempt,
    maxAttempts,
}) => {
    // Progress-based view: "3 / 5"
    return (
        <div className="d-flex align-items-center justify-content-center flex-column w-100">
            <div className="d-flex justify-content-between w-100 px-1 mb-1" style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                <span>Progress</span>
                <span className="fw-bold">{currentAttempt} / {maxAttempts} Passed</span>
            </div>

            <div className="progress w-100" style={{ height: "10px", backgroundColor: "rgba(255,255,255,0.2)" }}>
                <div
                    className="progress-bar bg-success"
                    style={{
                        width: `${(currentAttempt / maxAttempts) * 100}%`,
                        transition: "width 0.3s ease",
                    }}
                />
            </div>
            {/* Optional: Show last result if it exists */}
            {attemptResults.length > 0 && (
                <div className="mt-1" style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                    {/* Last pass: {attemptResults[attemptResults.length - 1].confidence.toFixed(2)} */}
                </div>
            )}
        </div>
    );
};
