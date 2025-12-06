import React from "react";
import "./ProfilePage.css"; // Reuse glassmorphism styles

export default function FAQPage() {
    return (
        <div className="container-fluid bg-black min-vh-100 p-0">
            <div className="p-4 p-lg-5">
                <h1 className="h3 text-white fw-bold mb-4">Frequently Asked Questions</h1>

                <div className="profile-card p-4 mb-4">
                    <h2 className="h5 text-info fw-bold mb-3">Privacy & Data</h2>

                    <div className="mb-4">
                        <h3 className="h6 text-white fw-bold">Do we use / store user data?</h3>
                        <p className="text-white-50">
                            No. We do not store any image data from users to improve our models.
                            All camera processing happens locally in your browser.
                        </p>
                    </div>

                    <div className="mb-4">
                        <h3 className="h6 text-white fw-bold">Is my camera feed recorded?</h3>
                        <p className="text-white-50">
                            No. The camera feed is analyzed in real-time to detect hand landmarks and is never recorded or sent to a server.
                        </p>
                    </div>
                </div>

                <div className="profile-card p-4">
                    <h2 className="h5 text-warning fw-bold mb-3">General</h2>

                    <div className="mb-4">
                        <h3 className="h6 text-white fw-bold">What is OpenHand?</h3>
                        <p className="text-white-50">
                            OpenHand is an open-source project designed to make learning sign language accessible and interactive using AI.
                        </p>
                    </div>

                    <div className="mb-0">
                        <h3 className="h6 text-white fw-bold">How can I contribute?</h3>
                        <p className="text-white-50">
                            Check out our GitHub repository linked in the Settings page to contribute code, report bugs, or suggest features!
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
