// FeatureSection.tsx
import React, { useEffect, useRef } from "react";
import "./FeatureSection.css";
import { Sparkles, ChartBar, Camera, Zap, BookOpen, Smartphone } from "lucide-react";

type Item = { title: string; text: string; icon: React.ReactNode };

const features: Item[] = [
  { title: "Interactive Lessons", text: "Learn ASL with step-by-step flows and instant feedback.", icon: <Sparkles size={28} /> },
  { title: "Progress Tracking", text: "See streaks, badges, and what to practice next.", icon: <ChartBar size={28} /> },
  { title: "Camera Guidance", text: "On-screen cues so your hands are always in frame.", icon: <Camera size={28} /> },
  { title: "Mini Challenges", text: "Short drills that fit your day—no pressure.", icon: <Zap size={28} /> },
  { title: "Docs & Help", text: "Built-in tips so you’re never stuck or alone.", icon: <BookOpen size={28} /> },
  { title: "Mobile Ready", text: "Works great on phones and tablets.", icon: <Smartphone size={28} /> },
];

export default function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll(".feature-card, .feature-fade-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-custom-color-dark text-white py-5 position-relative overflow-hidden d-flex align-items-center justify-content-center min-vh-100"
    >
      <div className="feature-shimmer position-absolute top-0 start-50 translate-middle-x"></div>

      <div className="container text-center">
        <h2 className="display-4  mb-3 feature-fade-up">What OpenHand Offers</h2>
        <p className="text-white-50 mb-5 feature-fade-up">
          Friendly, focused, and built to help you learn faster.
        </p>

        <div className="row justify-content-center g-4">
          {features.map((f, i) => (
            <div className="col-10 col-sm-6 col-lg-4" key={i}>
              <div
                className="feature-card border border-light rounded-4 h-100 p-4 mx-auto"
                style={{ borderColor: "rgba(255,255,255,0.25)", maxWidth: "340px" }}
              >
                <div className="d-flex flex-column align-items-center text-center mb-3">
                  <div className="feature-icon rounded-circle d-flex align-items-center justify-content-center mb-3">
                    {f.icon}
                  </div>
                  <h5 className="mb-2">{f.title}</h5>
                  <p className="text-white-50 mb-0">{f.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
