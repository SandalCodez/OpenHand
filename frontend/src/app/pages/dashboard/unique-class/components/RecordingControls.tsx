import React from "react";
import { Play, Square } from "lucide-react";

interface RecordingControlsProps {
    isRecording: boolean;
    currentAttempt: number;
    maxAttempts: number;
    timeRemaining: number;
    recordingDuration: number;
    onStartRecording: () => void;
    onStopRecording: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
    isRecording,
    currentAttempt,
    maxAttempts,
    timeRemaining,
    recordingDuration,
    onStartRecording,
    onStopRecording,
}) => {
    return (
        <div className="mb-4">
            {!isRecording ? (
                <button
                    onClick={onStartRecording}
                    className="btn btn-success rounded rounded-4 w-100"
                    style={{
                        fontSize: "1rem",
                        padding: "1rem",
                        fontWeight: "bold",
                    }}
                >
                    <Play size={24} className="me-2" />
                    Record Attempt {currentAttempt + 1}/{maxAttempts}
                </button>
            ) : (
                <div>
                    <button
                        onClick={onStopRecording}
                        className="btn btn-danger rounded rounded-4 w-100 mb-3"
                        style={{
                            fontSize: "1rem",
                            padding: "1rem",
                            fontWeight: "bold",
                        }}
                    >
                        <Square size={24} className="me-2" />
                        Stop Recording
                    </button>
                    {/* Countdown Timer */}
                    <div className="text-center mb-2">
                        <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                            {timeRemaining.toFixed(1)}s
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                            <div
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{
                                    width: `${(timeRemaining / (recordingDuration / 1000)) * 100}%`,
                                    transition: "width 0.1s linear",
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
