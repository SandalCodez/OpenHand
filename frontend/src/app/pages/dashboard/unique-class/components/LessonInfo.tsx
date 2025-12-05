import React from "react";
import MainMascotAnimation from "../../../../../components/animations/MainMascotAnimation";
import type { ClassData } from "../types";

interface LessonInfoProps {
    classData: ClassData;
    targetSign: string;
}

export const LessonInfo: React.FC<LessonInfoProps> = ({ classData, targetSign }) => {
    return (
        <div className="row">
            <div className="col-lg-10">
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
            </div>
            <div className="col-lg-2 align-self-center">
                <div className="mb-3">
                    <span className="badge bg-success p-2 me-2 rounded-5 custom-badge">
                        {classData.gained_XP} XP
                    </span>
                </div>
            </div>
        </div>
    );
};
