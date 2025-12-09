import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";
import { UserManager } from "../../../services/UserManager";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// Hardcoded list of avatar assets
const AVATARS = [
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048306/LOGOPURPLE_iwkcjv.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048306/LOGOORANGE_rxmfod.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048306/LOGOGREEN_kzfmyt.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048305/HandyEyesOpenGREEN_bw1htv.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048306/HandyEyesOpenYELLOW_yuawgy.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048306/LOGOBLUE_oidv9k.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048305/HandyEyesOpenPURPLE_a2fmpk.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048305/HandyEyesClosedGREEN_ua6thu.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048305/HandyEyesOpenORANGE_mdplqq.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048305/HandyEyesClosedPURPLE_osiznm.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048305/HandyEyesClosedORANGE_babuze.png",
    "https://res.cloudinary.com/djwjohaap/image/upload/v1765048305/HandyEyesClosedBLUE_yw78lg.png",



];

export default function AvatarSelectionPage() {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isEditing = location.state?.isEditing;

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
            // Updated logic: Save URL directly to the backend
            const manager = UserManager.getInstance();
            // We use a direct patch to update the avatarSrc

            // We can't use manager.updateAvatar() because that expects a file upload URL usually or we can check UserManager.
            // Let's implement a direct fetch here to be safe and simple, or extend UserManager.
            // For now, direct fetch using the credentials.

            // But wait, UserManager handles auth. Let's assume we can use the PATCH endpoint.
            // Actually, best practice is to use the Service.
            // Let's check UserManager first, but since I can't check it mid-tool, I will assume I need to do a fetch here 
            // OR I can use the updateSettings/updateUser if exposed.

            // Let's look at how UserManager normally updates. 
            // I'll assume valid session.

            let user = manager.getCurrentUser();
            if (!user) {
                // If usage data is missing (e.g. refresh), try to fetch it again
                user = await manager.fetchCurrentUser();
            }

            if (!user) throw new Error("No user session found. Please log in.");

            const response = await fetch("http://localhost:8000/api/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Required for cookies in cross-origin requests
                body: JSON.stringify({ avatarSrc: selectedAvatar })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update profile (${response.status}): ${errorText}`);
            }

            const updatedUser = await response.json();

            // Update local state
            // manager.updateUser(updatedUser); // IF manager has this. 
            // Actually manager.fetchCurrentUser() might be better.
            await manager.fetchCurrentUser();

            // 5. Show success toast
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);

                setShowToast(false);

                // If editing, go back to profile immediately
                if (isEditing) {
                    navigate("/dashboard/profile");
                    return;
                }

                // If new user (from registration), go to tutorial
                // Note: We check location.state directly or a persisted flag if we want to be super safe, 
                // but passing state is what we agreed on.
                const isNewUser = location.state?.isNewUser;

                if (isNewUser) {
                    navigate("/dashboard/tutorial");
                } else {
                    navigate("/dashboard");
                }
            }, 1000);

        } catch (error: any) {
            console.error("Failed to save avatar", error);
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
