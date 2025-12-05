import { Hand, Route, BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { UserManager, type UserStats } from "../../services/UserManager";
import type { User } from "../../assets/user";

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

function StartCard({ user, stats }: { user: User | null, stats: UserStats | null }) {
  const streak = user?.dailyStreak ?? 0;
  const level = user?.level ?? "Beginner";

  return (
    <CardShell className="resume-card">
      <div className="d-flex flex-column h-100">
        {/* header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            <Hand size={18} color="white" />
          </div>
          <div>
            <span className="text-secondary">Checkpoint</span>
          </div>
          <span className="badge bg-gradient-pulse small flex-shrink-0">
            Streak {streak}
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

            <span className=" ms-1 text-capitalize">Level: {level}</span>
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

function RoadmapCard({ stats }: { stats: UserStats | null }) {
  const completed = stats?.completedLessons ?? 0;
  // Simple mock progress for now based on completed lessons
  // Assuming ~20 lessons for Unit 1
  const progress = Math.min(Math.round((completed / 20) * 100), 100);

  return (
    <CardShell className="roadmap-card bento-full text-secondary">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <Route size={18} color="white" />
          <span className="fw-semibold small text-uppercase tracking-tight">
            Roadmap
          </span>
        </div>
        <span className="small">Unit 1 · {progress}%</span>
      </div>

      <div className="roadmap-track">
        <div className="roadmap-track-fill" style={{ width: `${progress}%` }} />

        <div
          className={`roadmap-node ${progress >= 8 ? 'roadmap-node-complete' : 'roadmap-node-pending'}`}
          style={{ left: "8%" }}
        />
        <div
          className={`roadmap-node ${progress >= 32 ? 'roadmap-node-complete' : 'roadmap-node-pending'}`}
          style={{ left: "32%" }}
        />
        <div
          className={`roadmap-node ${progress >= 62 ? 'roadmap-node-active' : 'roadmap-node-pending'}`}
          style={{ left: "62%" }}
        >
          {progress >= 62 && <div className="roadmap-node-glow" />}
        </div>
        <div
          className={`roadmap-node ${progress >= 88 ? 'roadmap-node-complete' : 'roadmap-node-pending'}`}
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
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const manager = UserManager.getInstance();
    const unsubscribe = manager.subscribe((u, s) => {
      setUser(u);
      setStats(s);
    });

    // Ensure data is fetched
    if (!manager.getCurrentUser()) {
      manager.fetchCurrentUser();
    }

    return () => unsubscribe();
  }, []);

  return (
    <div className="left-dashboard px-4 pb-4 text-secondary">
      <div className="bento-grid">
        <StartCard user={user} stats={stats} />
        <TodayFocusCard />
        <RoadmapCard stats={stats} />
      </div>
    </div>
  );
}
