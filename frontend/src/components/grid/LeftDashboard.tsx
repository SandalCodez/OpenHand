import { Hand, Route, BookOpen } from "lucide-react";
import type { ReactNode } from "react";

// Shared card wrapper
function CardShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-card border border-secondary ${className}`.trim()}>
      {children}
    </div>
  );
}

// --- Individual cards --- //

function StartCard() {
  return (
    <CardShell className="resume-card">
  <div className="d-flex flex-column h-100">
    {/* header */}
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div className="d-flex align-items-center gap-2">
        <Hand size={18} color="white"/>
      </div>
      <div>
        <span className="text-secondary">Checkpoint</span>
      </div>
      <span className="badge bg-gradient-pulse small flex-shrink-0">
        Streak 3
      </span>
    </div>

    {/* last sign block */}
    <div className="small mb-3">
      <div
        className="text-uppercase  mb-1"
        style={{ fontSize: "0.7rem" }}
      >
        Last sign <span className="fw-semibold text-light">“HELLO”</span>
      </div>
      <div>
        
        <span className=" ms-1">Level 1</span>
      </div>
    </div>

    {/* button */}
    <button
      type="button"
      className="btn btn-sm btn-outline-light fw-semibold rounded-pill px-3 align-self-start"
    >
      Continue
    </button>
  </div>
</CardShell>


  );
}

function TodayFocusCard() {
  return (
    <CardShell className="today-card">
      <div className="d-flex align-items-center gap-2 mb-1">
        <BookOpen size={18} color="white" />
        <span className="fw-semibold  tracking-tight">
          Today’s focus
        </span>
      </div>
      <ul className="small mb-0 ps-3">
        <li>Practice 5 letters with clean hand shape.</li>
      </ul>
      <button
        type="button"
        className="btn btn-sm btn-outline-light fw-semibold rounded-pill px-3 mt-3"
        >
        today's challenge
        </button>
    </CardShell>
  );
}

function RoadmapCard() {
  return (
    <CardShell className="roadmap-card bento-full text-secondary">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <Route size={18} color="white"/>
          <span className="fw-semibold small text-uppercase tracking-tight">
            Roadmap
          </span>
        </div>
        <span className="small">Unit 1 · 60%</span>
      </div>

      <div className="roadmap-track">
        <div className="roadmap-track-fill" style={{ width: "62%" }} />

        <div
          className="roadmap-node roadmap-node-complete"
          style={{ left: "8%" }}
        />
        <div
          className="roadmap-node roadmap-node-complete"
          style={{ left: "32%" }}
        />
        <div
          className="roadmap-node roadmap-node-active"
          style={{ left: "62%" }}
        >
          <div className="roadmap-node-glow" />
        </div>
        <div
          className="roadmap-node roadmap-node-pending"
          style={{ left: "88%" }}
        />
      </div>

      <div className="d-flex justify-content-between mt-2 small">
        <span>Intro</span>
        <span>Alphabet</span>
        <span>Words</span>
        <span>Sentences</span>
      </div>
    </CardShell>
  );
}

// --- Layout component --- //

export default function LeftDashboard() {
  return (
    <div className="left-dashboard px-4 pb-4 text-secondary">
      <div className="bento-grid">
        <StartCard />
        <TodayFocusCard />
        <RoadmapCard />
      </div>
    </div>
  );
}
