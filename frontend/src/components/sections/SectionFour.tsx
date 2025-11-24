import React from 'react';
import { ArrowRight } from 'lucide-react';
import './SectionFour.css';

export default function SectionFour() {
    return (
        <div className="section-four-container">
            <div className="container">
                <div className="cta-wrapper text-center">
                    <div className="cta-content">
                        <h2 className="cta-title display-3 fw-bold mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="cta-subtitle lead mb-5">
                            Join thousands of learners mastering American Sign Language today.
                            It's free, fun, and effective.
                        </p>

                        <a className="btn btn-lg btn-primary cta-button rounded-pill px-5 py-3 d-inline-flex align-items-center gap-2">
                            Get Started Now <ArrowRight size={24} />
                        </a>
                    </div>

                    {/* Decorative elements */}
                    <div className="cta-glow"></div>
                </div>
            </div>
        </div>
    );
}
