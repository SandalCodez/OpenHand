import "./ActionHomePage.css"
import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Hand, Route } from "lucide-react";

import Camera from "../../../components/camera/Camera";
import AslWebcamSender from "../../../components/AslWebcamSender";
import InfoButton from "../../../components/progress/InfoButton";
import HandLandmarks from "../../../components/handlandmarks/HandLandmarks";
import MainMascotAnimation from "../../../components/animations/MainMascotAnimation";

type TabKey = "Road" | "classes";

export default function ActionHomePage() {
  const context = useOutletContext<{ user: any }>();
  const user = context?.user;

  const [tab, setTab] = useState<TabKey>("Road");
  const [view, setView] = useState<"camera" | "landmarks">("landmarks");
  const [showDaily, setShowDaily] = useState(true);

  console.log("Current user in ActionHimePage", user);

  return (
    <div className="row g-0 min-vh-100">
      {/* LEFT – DASHBOARD + MASCOT */}
      <div className="col-12 col-lg-6 position-relative d-flex flex-column left-panel">
        {/* daily message bubble from mascot */}
        {showDaily && (
          <div className="daily-message-bubble shadow-lg">
            <p className="mb-1 fw-semibold">
              Hey {user?.first_name || user?.name || "friend"} 👋
            </p>
            <p className="mb-0 small text-light">
              Let’s pick up where you left off and grab one more sign today.
            </p>
          </div>
        )}

        {/* mascot area */}
        <div className="mascot-wrap position-relative d-flex flex-column align-items-center pt-4">
          <MainMascotAnimation size={340} />
          <div className="mascot-ground2" />
          <svg className="mascot-swiggle" width="130" height="28" viewBox="0 0 130 28">
            <path
              className="swiggle-path"
              d="M5 14 C 25 2, 45 26, 65 14 C 85 2, 105 26, 125 14"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <svg className="mascot-swiggle2" width="130" height="28" viewBox="0 0 130 28">
            <path
              className="swiggle-path"
              d="M5 14 C 25 2, 45 26, 65 14 C 85 2, 105 26, 125 14"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* dashboard cards */}
        <div className="left-dashboard px-4 pb-4">
          {/* Start where you left off */}
          <div className="glass-card resume-card mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <Hand size={18} />
                <span className="fw-semibold small text-uppercase tracking-tight">
                  Start where you left off
                </span>
              </div>
              <span className="badge bg-gradient-pulse small">Streak · 3 days</span>
            </div>
            <p className="mb-2 small text-muted">
              Last sign: <span className="fw-semibold text-light">“HELLO”</span> · Level 1 · Checkpoint 2
            </p>
            <button
              type="button"
              className="btn btn-sm btn-light fw-semibold rounded-pill px-3"
            >
              Continue lesson
            </button>
          </div>

          {/* Roadmap */}
          <div className="glass-card roadmap-card mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <Route size={18} />
                <span className="fw-semibold small text-uppercase tracking-tight">
                  Your Roadmap
                </span>
              </div>
              <span className="small text-muted">Unit 1 · 60%</span>
            </div>

            <div className="roadmap-track">
              <div className="roadmap-track-fill" style={{ width: "62%" }} />

              <div className="roadmap-node roadmap-node-complete" style={{ left: "8%" }} />
              <div className="roadmap-node roadmap-node-complete" style={{ left: "32%" }} />
              <div className="roadmap-node roadmap-node-active" style={{ left: "62%" }}>
                <div className="roadmap-node-glow" />
              </div>
              <div className="roadmap-node roadmap-node-pending" style={{ left: "88%" }} />
            </div>

            <div className="d-flex justify-content-between mt-2 small text-muted">
              <span>Intro</span>
              <span>Alphabet</span>
              <span>Words</span>
              <span>Sentences</span>
            </div>
          </div>

          {/* Daily message / tips list */}
          <div className="glass-card mb-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <BookOpen size={18} />
              <span className="fw-semibold small text-uppercase tracking-tight">
                Today’s focus
              </span>
            </div>
            <ul className="small mb-0 ps-3 text-muted">
              <li>Practice 5 letters with clean hand shape.</li>
              <li>Keep your hand inside the guide box on screen.</li>
              <li>Try one “no-pressure” mini challenge.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT – camera / landmarks */}
      <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border-start border-1 border-light py-3">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
          <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
            <AslWebcamSender wsUrl="ws://localhost:8000/ws" mode="letters" />
          </div>
        </div>

        {/* toggle */}
        <div className="mt-3">
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-sm ${view === "camera" ? "btn-light" : "btn-outline-light"}`}
              onClick={() => setView("camera")}
            >
              Camera
            </button>
            <button
              type="button"
              className={`btn btn-sm ${view === "landmarks" ? "btn-light" : "btn-outline-light"}`}
              onClick={() => setView("landmarks")}
            >
              Landmarks
            </button>
          </div>
        </div>
      </div>

{/* RIGHT */}
<div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border-start border-1 border-light py-3">
  {/* content area */}
  <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
      <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
          <AslWebcamSender wsUrl="ws://localhost:8001/ws" mode="letters" />
      </div>
  </div>

  {/* toggle */}
  <div className="mt-3">
    <div className="btn-group">
      <button
        type="button"
        className={`btn btn-sm ${view === "camera" ? "btn-light" : "btn-outline-light"}`}
        onClick={() => setView("camera")}
      >
        Camera
      </button>
      <button
        type="button"
        className={`btn btn-sm ${view === "landmarks" ? "btn-light" : "btn-outline-light"}`}
        onClick={() => setView("landmarks")}
      >
        Landmarks
      </button>
    </div>
  </div>
</div>
    </div>
  );
}
