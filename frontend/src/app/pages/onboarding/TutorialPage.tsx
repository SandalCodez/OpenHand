import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import AslWebcamSender from "../../../components/AslWebcamSender";
import { LessonInfo } from "../dashboard/unique-class/components/LessonInfo";
import { StatsOverlay } from "../dashboard/unique-class/components/StatsOverlay";
import "../dashboard/UniqueClassPage.css";

export default function TutorialPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    // Mock Data for the Tutorial - Matching the screenshot style
    const mockClassData = {
        id: "tutorial-1",
        title: "Letter A",
        description: "Learn how to sign the letter A.",
        image_url: "https://res.cloudinary.com/djwjohaap/image/upload/v1760500310/Doodle_Handz_Vector_A_yzdvxo.png", // Using logo as a placeholder or could be a specific asset if available
        category: "letters",
        lesson_id: "letters-a",
        video_url: "",
        xp: 0,
        unlock_threshold: 0.8,
        difficulty: "easy",
        passing_accuracy: 0.4,
        gained_XP: 0,
        instructions: "Make a fist with thumb resting against the side of your index finger",
        order: 1
    };

    const mockTargetSign = "A";
    const mockAttemptResults = [false, false, false, false, false];
    const MAX_ATTEMPTS = 5;
    const currentAttempt = 0;

    // Step Definitions
    const steps = [
        {
            target: "lesson-info",
            title: "Your Goal",
            content: "Study the image of the sign shown here, and read the description carefully.",
            position: "left"
        },
        {
            target: "webcam-area",
            title: "Performance Area",
            content: "Mimic the sign in front of your camera. Make sure your hand is visible.",
            position: "right"
        },
        {
            target: "progress-bar",
            title: "Progress Bar ",
            content: (
                <span>
                    Try and hold the sign until the green bar is full! This is how you pass a class. Once you get one pass put your hand down and let the progress bar reset. TRY IT OUT!
                    <ArrowRight className="ms-2 d-inline-block text-primary" size={24} strokeWidth={3} />
                </span>
            ),
            position: "bottom right"
        },
        {
            target: "controls-area", // Highlighting the bottom bar
            title: "Track & Navigate",
            content: "Check your progress bar. You need 5 successes to pass.",
            position: "bottom"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleFinish = () => {
        navigate("/dashboard/actionHome");
    };

    const getHighlightClass = (targetName: string) => {
        if (steps[step].target === targetName) return "tutorial-highlighted z-3 bg-dark rounded-4";
        return "tutorial-dimmed";
    };

    return (
        <div className="container-fluid unique-class-page position-relative h-100">
            <style>{`
                .tutorial-highlighted {
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85);
                    transition: all 0.3s ease;
                }
                .tutorial-dimmed {
                     transition: all 0.3s ease;
                }
                .tutorial-popover {
                    position: absolute;
                    z-index: 1060;
                    background: white;
                    color: black;
                    padding: 20px;
                    width: 300px;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>

            {/* Popover */}
            <div className="tutorial-popover" style={{
                top: step === 0 ? "30%" : step === 1 ? "50%" : "82%",
                left: step === 0 ? "25%" : step === 1 ? "75%" : "50%",
                transform: "translate(-50%, -50%)",
            }}>
                <h4 className="fw-bold mb-2">{steps[step].title}</h4>
                <p className="mb-3 text-secondary small">{steps[step].content}</p>
                <div className="d-flex justify-content-between align-items-center">
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleBack} disabled={step === 0}>Back</button>
                    <button className="btn btn-sm btn-primary px-3" onClick={handleNext}>
                        {step === steps.length - 1 ? "Start Learning" : "Next"}
                    </button>
                </div>
            </div>


            <div className="row h-100">
                {/* LEFT SIDE */}
                <div className={`col-12 col-lg-6 border-end border-secondary text-white py-3 d-flex flex-column justify-content-between unique-left ${getHighlightClass("lesson-info")}`}>
                    <div className="px-3">
                        <LessonInfo classData={mockClassData} targetSign={mockTargetSign} />
                        <hr className="border-secondary my-3 opacity-25" />

                        {/* Card Area similar to screenshot */}
                        <div className="d-flex flex-column align-items-center mt-4">
                            <div className="position-relative p-2 border border-secondary rounded-4 bg-dark bg-opacity-50" style={{ width: "220px", height: "220px" }}>
                                <img src={mockClassData.image_url} alt="A" className="w-100 h-100 object-fit-contain opacity-75" />
                                {/* Red square overlay simulation if needed, but keeping simple for now */}
                            </div>
                            <h2 className="mt-3 fw-bold">Letter A</h2>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className={`px-4 pb-3 ${getHighlightClass("controls-area")}`}>
                        <div className="d-flex align-items-center justify-content-between gap-3 p-2 rounded-4 bg-dark border border-secondary">
                            <button className="btn btn-dark fw-bold px-3 rounded-pill d-flex align-items-center gap-2" disabled>
                                <ChevronLeft size={18} /> Prev
                            </button>

                            <div className="flex-grow-1 mx-2">
                                <div className="d-flex justify-content-between small text-white-50 mb-1">
                                    <span>Progress</span>
                                    <span>0/5 Passed</span>
                                </div>
                                <div className="progress" style={{ height: "8px", backgroundColor: "#333" }}>
                                    <div className="progress-bar bg-secondary" style={{ width: "0%" }}></div>
                                </div>
                            </div>

                            <button className="btn btn-light fw-bold px-3 rounded-pill d-flex align-items-center gap-2" onClick={handleNext}>
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className={`col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center bg-black text-white p-0 position-relative ${getHighlightClass("webcam-area")}`}>
                    <AslWebcamSender
                        wsUrl="ws://localhost:8000/ws"
                        mode="letters"
                        model="letters"
                        target={mockTargetSign}
                        onPrediction={() => { }}
                    />
                    <div className="position-absolute bottom-0 start-0 p-3 w-100">
                        <div className="d-flex justify-content-between align-items-end">
                            <span className="badge bg-primary">Active Model: LETTERS & NUMBERS</span>
                            <div className="text-end text-white-50 small font-monospace">
                                <div>Model: letters • Feats: 336</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
