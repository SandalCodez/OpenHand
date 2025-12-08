import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Award, CheckCircle, ArrowRight } from "lucide-react";
import { BADGES, getBadgeByXP } from "../../../assets/badges";

export default function ClaimBadgePage() {
    const { xp } = useParams();
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setShowContent(true);
    }, []);

    const xpVal = xp ? parseInt(xp) : 0;
    const badge = getBadgeByXP(xpVal);

    return (
        <div className="container-fluid bg-black min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 position-relative overflow-hidden">

            {/* Background Glow */}
            <div className="position-absolute top-50 start-50 translate-middle rounded-circle"
                style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(13,202,240,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 }}></div>

            <div className={`text-center position-relative z-1 transition-all duration-1000 ${showContent ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}>

                {/* Header */}
                <h1 className="display-4 fw-bold text-white mb-2">CONGRATULATIONS!</h1>
                <p className="text-info fs-4 fw-light mb-5">You've reached a new milestone</p>

                {/* Badge Display */}
                <div className="mb-5 position-relative d-inline-block">
                    <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 bg-info rounded-circle blur-xl opacity-50 animate-pulse"></div>
                    <div className="bg-dark border border-4 border-info rounded-circle d-flex align-items-center justify-content-center shadow-lg position-relative overflow-hidden"
                        style={{ width: '200px', height: '200px' }}>
                        {badge?.imageUrl ? (
                            <img src={badge.imageUrl} alt={badge.title} className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <span style={{ fontSize: '80px' }}>🏅</span>
                        )}
                    </div>

                    <div className="position-absolute top-100 start-50 translate-middle-x mt-3 badge bg-dark text-white border border-secondary px-3 py-2 rounded-pill fs-5">
                        {badge?.title || `${xp} XP BADGE`}
                    </div>
                </div>

                {/* Info */}
                <div className="card bg-white bg-opacity-10 border-0 rounded-4 p-4 max-w-md mx-auto mb-5 backdrop-blur-sm" style={{ maxWidth: '400px' }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-success rounded-circle p-2 d-flex align-items-center justify-content-center">
                            <CheckCircle size={24} className="text-white" />
                        </div>
                        <div className="text-start">
                            <div className="text-white fw-bold">Badge Unlocked</div>
                            <div className="text-white-50 small">Successfully added to your profile</div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-warning rounded-circle p-2 d-flex align-items-center justify-content-center">
                            <Award size={24} className="text-white" />
                        </div>
                        <div className="text-start">
                            <div className="text-white fw-bold">Level {badge ? badge.xp / 50 : 1} Reached</div>
                            <div className="text-white-50 small">Keep going to unlock Level {(badge ? badge.xp / 50 : 1) + 1}!</div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => navigate('/dashboard/roadmap')}
                    className="btn btn-lg btn-info text-white rounded-pill px-5 py-3 fw-bold d-inline-flex align-items-center gap-2 hover-scale shadow-lg"
                >
                    Continue Journey <ArrowRight size={20} />
                </button>

            </div>
        </div>
    );
}
