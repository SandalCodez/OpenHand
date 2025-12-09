import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";
import { UserManager } from "../../../services/UserManager";
import { Check } from "lucide-react";

// Updated list of sign-language related titles
const TITLES = [
    "Signing Starter",
    "Finger Spelling Fan",
    "Gesture Guru",
    "Visual Voice",
    "Silent Speaker",
    "Hand Shape Hero",
    "Expression Expert",
    "Fluency Seeker",
    "Motion Master",
    "Sign Language Star"
];

// Preset vibrant colors
const COLORS = [
    "#A855F7", // Purple
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Orange
    "#EF4444", // Red
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#EAB308", // Gold
];

export default function TitleSelectionPage() {
    const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    // Load current user's title & color if available
    useEffect(() => {
        const user = UserManager.getInstance().getCurrentUser();
        if (user?.title) setSelectedTitle(user.title);
        else setSelectedTitle(TITLES[0]);

        if (user?.titleColor) setSelectedColor(user.titleColor);
    }, []);

    const handleSave = async () => {
        if (!selectedTitle) return;
        setLoading(true);
        try {
            const manager = UserManager.getInstance();
            let user = manager.getCurrentUser();
            if (!user) {
                user = await manager.fetchCurrentUser();
            }

            if (!user) throw new Error("No user session found. Please log in.");

            const response = await fetch("http://localhost:8000/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    title: selectedTitle,
                    titleColor: selectedColor
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update profile (${response.status}): ${errorText}`);
            }

            await manager.fetchCurrentUser();

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                navigate("/dashboard/profile");
            }, 1000);

        } catch (error: any) {
            console.error("Failed to save title", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex flex-column text-white position-relative overflow-hidden">
            <style>
                {`
                @keyframes pulse-glow {
                    0% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.6; }
                    100% { transform: scale(1); opacity: 0.3; }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 3s infinite ease-in-out;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .title-card {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    min-width: 120px;
                    text-align: center;
                    font-size: 0.8rem;
                }
                .title-card:hover {
                    transform: scale(1.05);
                    background: rgba(255, 255, 255, 0.15) !important;
                }
                .title-card.active {
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
                }
                .color-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform 0.2s;
                    border: 2px solid transparent;
                }
                .color-circle:hover {
                    transform: scale(1.2);
                }
                .color-circle.active {
                    border-color: white;
                    transform: scale(1.2);
                    box-shadow: 0 0 10px currentColor;
                }
                `}
            </style>

            {/* Toast Notification */}
            {showToast && (
                <div className="position-absolute top-0 start-50 translate-middle-x mt-4 p-3 rounded-pill bg-success text-white shadow-lg d-flex align-items-center gap-2" style={{ zIndex: 1050, animation: "fadeIn 0.3s ease-out" }}>
                    <Check size={20} />
                    <span className="fw-bold">Title Updated Successfully!</span>
                </div>
            )}

            {/* Background Elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0, opacity: 0.1 }}>
                {/* Optional background pattern */}
            </div>

            <div className="container z-1 d-flex flex-column h-100 py-4">

                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="display-6 fw-bold">Customize Your Title</h1>
                    <p className="text-white-50">Choose a title and a color to represent your sign language journey.</p>
                </div>

                {/* Main Content Area */}
                <div className="row flex-grow-1 align-items-center justify-content-center">

                    {/* Left: Mascot */}
                    <div className="col-md-5 d-flex justify-content-center align-items-center mb-4 mb-md-0">
                        <div style={{ transform: "scale(1.2)" }}>
                            <MainMascotAnimation size={350} />
                        </div>
                    </div>

                    {/* Right: Title & Color Selection */}
                    <div className="col-md-7 d-flex flex-column justify-content-center align-items-center gap-4">

                        {/* Selected Title Preview */}
                        <div className="position-relative p-5 rounded-4 border border-secondary bg-black bg-opacity-50 shadow-lg text-center" style={{ minWidth: "350px" }}>
                            <div className="position-absolute top-50 start-50 translate-middle rounded-circle animate-pulse-glow"
                                style={{ width: "200px", height: "200px", filter: "blur(60px)", zIndex: -1, backgroundColor: selectedColor, opacity: 0.5 }}></div>

                            <h2
                                className="display-6 fw-bold mb-0"
                                style={{
                                    textShadow: `0 0 15px ${selectedColor}`,
                                    color: selectedColor
                                }}
                            >
                                {selectedTitle || "Select a Title"}
                            </h2>
                            <div className="mt-2 text-white-50 small">Preview</div>
                        </div>

                        {/* Color Picker */}
                        <div className="d-flex gap-3 justify-content-center mb-2">
                            {COLORS.map(color => (
                                <div
                                    key={color}
                                    className={`color-circle ${selectedColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color, color: color }} // color prop used for box-shadow in css
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>

                        {/* Grid of Titles */}
                        <div className="d-flex flex-wrap justify-content-center mb-3 gap-3" style={{ maxHeight: "300px", overflowY: "auto", padding: "10px" }}>
                            {TITLES.map((title) => {
                                const isActive = selectedTitle === title;
                                return (
                                    <div
                                        key={title}
                                        onClick={() => setSelectedTitle(title)}
                                        className={`title-card p-2 rounded-4 border border-1 bg-dark bg-opacity-10 ${isActive ? 'active' : 'border-transparent'}`}
                                        style={isActive ? { borderColor: selectedColor, backgroundColor: `rgba(255,255,255,0.2)` } : {}}
                                    >
                                        <div className="fw-light " style={isActive ? { color: selectedColor } : {}}>{title}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom: Save Button */}
                <div className="mt-auto pb-5 text-center">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn rounded-4 px-4 py-3 fw-bold shadow-lg hover-lift text-white border-0"
                        style={{ minWidth: "220px", fontSize: "1rem", backgroundColor: selectedColor }}
                    >
                        {loading ? "Saving..." : "Confirm Title & Color"}
                    </button>
                    <div className="mt-3">
                        <button
                            className="btn btn-link text-white-50 text-decoration-none"
                            onClick={() => navigate("/dashboard/profile")}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
