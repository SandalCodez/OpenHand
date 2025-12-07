import React from "react";
import MainMascotAnimation from "../../../../../components/animations/MainMascotAnimation";
import type { ClassData } from "../types";

interface LessonInfoProps {
    classData: ClassData;
    targetSign: string;
}

export const LessonInfo: React.FC<LessonInfoProps> = ({ classData, targetSign }) => {
    return (
        <div className="d-flex flex-column w-100">
            <div className="d-flex align-items-center gap-4 py-3">
                <div className="flex-shrink-0">
                    <MainMascotAnimation size={140} />
                </div>
                <div className="flex-grow-1">
                    <div className="text-secondary small text-uppercase mb-1 fw-bold tracking-wide">How to sign</div>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="badge bg-light text-dark fs-3 px-3 py-2 rounded-3 shadow-sm font-monospace border">{targetSign}</span>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill custom-badge">
                            +{classData.gained_XP} XP
                        </span>
                    </div>

                    <p className="lead text-white lh-base mb-0 pe-4" style={{ fontSize: "1.1rem" }}>
                        {classData.instructions}
                    </p>
                </div>
            </div>
            <hr className="w-100 my-2 border-secondary opacity-25" />
        </div>
    );
};
