import React from 'react';
import { Camera, Gamepad2, Globe } from 'lucide-react';
import './SectionThree.css';

export default function SectionThree() {
    return (
        <div className="section-three-container">
            <div className="container py-5">
                <div className="row justify-content-center mb-5">
                    <div className="col-lg-8 text-center">
                        <h2 className="mission-title display-4 fw-bold mb-4">Our Mission</h2>
                        <p className="mission-subtitle lead text-white-50">
                            Breaking down communication barriers through the power of AI and gamification.
                            We believe learning ASL should be accessible, effective, and fun for everyone.
                        </p>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Card 1 */}
                    <div className="col-md-4">
                        <div className="mission-card">
                            <div className="icon-wrapper mb-4">
                                <Camera size={48} color="#00a6ff" />
                            </div>
                            <h3 className="h4 text-white mb-3">AI-Powered Feedback</h3>
                            <p className="text-white-50">
                                Our advanced computer vision technology gives you instant feedback on your hand signs,
                                ensuring you learn correctly from day one.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="col-md-4">
                        <div className="mission-card featured">
                            <div className="icon-wrapper mb-4">
                                <Gamepad2 size={48} color="#ffffff" />
                            </div>
                            <h3 className="h4 text-white mb-3">Gamified Learning</h3>
                            <p className="text-white-50">
                                Earn points, maintain streaks, and unlock achievements.
                                We turned language learning into a game you'll actually want to play.
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="col-md-4">
                        <div className="mission-card">
                            <div className="icon-wrapper mb-4">
                                <Globe size={48} color="#00a6ff" />
                            </div>
                            <h3 className="h4 text-white mb-3">Accessible to All</h3>
                            <p className="text-white-50">
                                Education should be free and accessible.
                                Join a global community of learners bridging the gap between the hearing and Deaf worlds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
