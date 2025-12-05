import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";
import { UserManager } from "../../../services/UserManager";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// Hardcoded list of avatar assets
const AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Abby",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ruby",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
];

export default function AvatarSelectionPage() {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    // Load current user's avatar if available
    useEffect(() => {
        const user = UserManager.getInstance().getCurrentUser();
        if (user?.avatarSrc) {
            setSelectedAvatar(user.avatarSrc);
        } else {
            setSelectedAvatar(AVATARS[0]);
        }
    }, []);

    const handleSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
    };

    const handleSave = async () => {
        if (!selectedAvatar) return;
        setLoading(true);
        try {
            // 1. Fetch the image from the external URL
            const response = await fetch(selectedAvatar);
            const blob = await response.blob();

            // 2. Create a File object (simulating a user upload)
            // We use .svg extension because DiceBear returns SVGs
            const file = new File([blob], "avatar.svg", { type: "image/svg+xml" });

            // 3. Upload to backend
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("http://localhost:8000/api/users/me/avatar", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload avatar to backend");
            }

            const data = await uploadRes.json();
            const newAvatarUrl = data.avatarSrc;

            // 4. Update UserManager
            const manager = UserManager.getInstance();
            // We pass the new local URL returned by the backend
            await manager.updateAvatar(newAvatarUrl);

            // 5. Show success toast
            setShowToast(true);
            navigate("/dashboard");
            setTimeout(() => setShowToast(false), 3000);

        } catch (error) {
            console.error("Failed to save avatar", error);
            alert("Failed to save avatar. Please try again.");
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
                `}
            </style>

            {/* Toast Notification */}
            {showToast && (
                <div className="position-absolute top-0 start-50 translate-middle-x mt-4 p-3 rounded-pill bg-success text-white shadow-lg d-flex align-items-center gap-2" style={{ zIndex: 1050, animation: "fadeIn 0.3s ease-out" }}>
                    <Check size={20} />
                    <span className="fw-bold">Avatar Updated Successfully!</span>
                </div>
            )}

            {/* Background Elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0, opacity: 0.1 }}>
                {/* Optional background pattern */}
            </div>

            <div className="container z-1 d-flex flex-column h-100 py-4">

                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="display-4 fw-bold">Choose Your Look</h1>
                    <p className="text-white-50">Select an avatar to represent you in the classroom.</p>
                </div>

                {/* Main Content Area: Split Left (Mascot) and Right (Avatar Display) */}
                <div className="row flex-grow-1 align-items-center justify-content-center">

                    {/* Left: Mascot */}
                    <div className="col-md-6 d-flex justify-content-center align-items-center mb-4 mb-md-0">
                        <div style={{ transform: "scale(1.2)" }}>
                            <MainMascotAnimation size={400} />
                        </div>
                    </div>

                    {/* Right: Selected Avatar Display */}
                    <div className="col-md-6 d-flex flex-column justify-content-center align-items-center gap-3">
                        <div className="position-relative" style={{ width: "280px", height: "280px" }}>
                            {/* Animated Background Glow */}
                            <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary animate-pulse-glow"
                                style={{ width: "320px", height: "320px", filter: "blur(40px)", zIndex: -1 }}></div>

                            <div className="avatar-display rounded-circle overflow-hidden border border-4 border-primary shadow-lg w-100 h-100 bg-secondary">
                                <img
                                    src={selectedAvatar || AVATARS[0]}
                                    alt="Selected Avatar"
                                    className="w-100 h-100 object-fit-cover"
                                />
                            </div>
                            {/* Selection Indicator */}
                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-3 border border-dark shadow">
                                <Check size={32} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Slider & Controls */}
                <div className="mt-auto pb-5">
                    {/* Carousel Controls */}
                    <div className="d-flex align-items-center justify-content-center mb-4 gap-3 w-100 px-4">
                        <button
                            onClick={() => {
                                document.getElementById('avatar-slider')?.scrollBy({ left: -200, behavior: 'smooth' });
                            }}
                            className="btn btn-outline-light rounded-circle p-3 d-flex align-items-center justify-content-center hover-scale flex-shrink-0"
                            style={{ width: "50px", height: "50px" }}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Scrollable Slider Container */}
                        <div
                            id="avatar-slider"
                            className="d-flex gap-3 px-3 align-items-center overflow-x-auto no-scrollbar"
                            style={{
                                maxWidth: "800px",
                                scrollBehavior: "smooth",
                                whiteSpace: "nowrap",
                                scrollSnapType: "x mandatory",
                                maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
                            }}
                        >
                            {AVATARS.map((avatar, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelect(avatar)}
                                    className={`rounded-circle overflow-hidden cursor-pointer flex-shrink-0 transition-all ${selectedAvatar === avatar ? 'border border-3 border-primary scale-110 shadow-lg' : 'border border-2 border-transparent opacity-50 hover-opacity-100'}`}
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                        scrollSnapAlign: "center"
                                    }}
                                >
                                    <img src={avatar} alt={`Avatar ${idx}`} className="w-100 h-100 object-fit-cover" />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                document.getElementById('avatar-slider')?.scrollBy({ left: 200, behavior: 'smooth' });
                            }}
                            className="btn btn-outline-light rounded-circle p-3 d-flex align-items-center justify-content-center hover-scale flex-shrink-0"
                            style={{ width: "50px", height: "50px" }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Save Button */}
                    <div className="text-center">
                        <button
                            onClick={handleSave}
                            disabled={loading}

                            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg hover-lift"
                            style={{ minWidth: "250px", fontSize: "1.2rem" }}
                        >
                            {loading ? "Saving..." : "Lookin' Good! Let's Go"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
