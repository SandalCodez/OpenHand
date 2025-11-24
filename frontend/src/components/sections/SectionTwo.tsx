import React from 'react';
import MainMascotAnimation from '../animations/MainMascotAnimation';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import './SectionTwo.css';

export default function SectionTwo() {
    return (
        <div className="container-fluid px-0">
            <div className="row g-0">
                {/* Left Column - Sticky Mascot */}
                <div className="col-lg-5 d-none d-lg-flex justify-content-center align-items-start" style={{ position: 'relative' }}>
                    <div className="sticky-top d-flex flex-column align-items-center justify-content-center" style={{ top: '20vh', height: '60vh', width: '100%' }}>
                        <MainMascotAnimation size={400} />
                        <div
                            style={{
                                width: '250px',
                                height: '20px',
                                background: 'rgba(104, 197, 255, 0.3)',
                                borderRadius: '50%',
                                marginTop: '-70px',
                                filter: 'blur(0px)'
                            }}
                        />
                    </div>
                </div>

                {/* Right Column - Scroll Stack */}
                <div className="col-12 col-lg-7">
                    <ScrollStack useWindowScroll={false} itemScale={0.05} itemDistance={80}>
                        <ScrollStackItem>
                            <div className="scroll-stack-card-content">
                                <div className="scroll-stack-card-image">
                                    <img src="HandLandMark.png" alt="AI Hand Tracking" />
                                </div>
                                <div className="scroll-stack-card-text">
                                    <h2>Real-Time AI Tracking</h2>
                                    <p>
                                        Experience cutting-edge hand tracking technology that provides instant feedback on your ASL gestures.
                                        Our AI analyzes your movements in real-time to ensure you're learning correctly.
                                    </p>
                                </div>
                            </div>
                        </ScrollStackItem>
                        <ScrollStackItem>
                            <div className="scroll-stack-card-content">
                                <div className="scroll-stack-card-image">
                                    <img src="mascot-smiling.png" alt="Interactive Learning" style={{ objectFit: 'contain', padding: '20px', background: '#111' }} />
                                </div>
                                <div className="scroll-stack-card-text">
                                    <h2>Interactive Mascot</h2>
                                    <p>
                                        Meet your new learning companion! Our friendly mascot guides you through lessons,
                                        celebrates your victories, and makes learning American Sign Language fun and engaging.
                                    </p>
                                </div>
                            </div>
                        </ScrollStackItem>
                        <ScrollStackItem>
                            <div className="scroll-stack-card-content">
                                <div className="scroll-stack-card-image">
                                    <img src="logo.png" alt="Track Progress" style={{ objectFit: 'contain', padding: '40px', background: '#000' }} />
                                </div>
                                <div className="scroll-stack-card-text">
                                    <h2>Track Your Journey</h2>
                                    <p>
                                        Monitor your progress as you master new signs and levels.
                                        From alphabets to complex gestures, watch your skills grow with our comprehensive curriculum.
                                    </p>
                                </div>
                            </div>
                        </ScrollStackItem>
                    </ScrollStack>
                </div>
            </div>
        </div>
    );
}
