import { Hand, Route, Trophy, Flame, Star, CheckCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserManager, type UserStats } from "../../services/UserManager";
import type { User } from "../../assets/user";

// Shared card wrapper
function CardShell({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`glass-card border border-secondary ${className} ${onClick ? "cursor-pointer hover:border-accent/50 transition-colors" : ""}`.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// --- Individual cards --- //

function ChallengeCard({ isCompleted, lesson }: { isCompleted: boolean; lesson: any }) {
  const navigate = useNavigate();

  if (!lesson) {
    return (
      <CardShell className="resume-card d-flex align-items-center justify-content-center">
        <div className="spinner-border text-light spinner-border-sm" role="status"></div>
      </CardShell>
    )
  }

  const handleStart = () => {
    // Updated route based on user feedback/investigation
    navigate(`/dashboard/UniqueClass/${lesson.lesson_id}`);
  };

  return (
    <CardShell className="today-card position-relative overflow-hidden" onClick={handleStart}>
      <div className="d-flex flex-column h-100 position-relative z-2">
        {/* header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-2">
            <Trophy size={18} className={isCompleted ? "text-warning" : "text-white"} />
          </div>
          <div>
            <span className="text-white small fw-bold tracking-wider">DAILY CHALLENGE</span>
          </div>
          {isCompleted && (
            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 small d-flex align-items-center gap-1">
              <CheckCircle size={12} />
              Done
            </span>
          )}
        </div>

        {/* Challenge content */}
        <div className="mb-3">
          <div
            className="text-uppercase text-secondary mb-1"
            style={{ fontSize: "0.7rem" }}
          >
            Today's Gesture
          </div>
          <div className="d-flex align-items-baseline gap-2">
            <h3 className="mb-0 fw-bold text-light">{lesson.title}</h3>
          </div>
        </div>

        {/* button */}
        <button
          type="button"
          className={`btn btn-sm ${isCompleted ? 'btn-outline-success' : 'btn-light'} fw-semibold rounded-pill px-4 align-self-start mt-auto`}
        >
          {isCompleted ? "Practice Again" : "Start Challenge"}
        </button>
      </div>

      {/* Background/Decoration - subtle glow */}
      <div className={`position-absolute top-0 end-0 p-5 rounded-circle blur-3xl opacity-10 ${isCompleted ? 'bg-success' : 'bg-primary'}`} style={{ transform: 'translate(30%, -30%)', width: '150px', height: '150px' }}></div>
    </CardShell>
  );
}

function StatsCard({ user, stats }: { user: User | null, stats: UserStats | null }) {
  const streak = user?.dailyStreak ?? 0;
  const level = user?.level ?? "Beginner";
  const xp = user?.xp ?? 0;

  return (
    <CardShell className="today-card">
      <div className="d-flex flex-column gap-3 h-100 justify-content-center">

        {/* Streak Row */}
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }}>
            <Flame size={20} className="text-danger" />
          </div>
          <div>
            <div className="h4 mb-0 fw-bold text-light">{streak}</div>
            <div className="small text-secondary text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Day Streak</div>
          </div>
        </div>

        <div className="border-bottom border-secondary opacity-25 my-1"></div>

        {/* XP / Level Row */}
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 rounded-circle bg-warning bg-opacity-10 d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }}>
            <Star size={20} className="text-warning" />
          </div>
          <div>
            <div className="h4 mb-0 fw-bold text-light">{xp}</div>
            <div className="small text-secondary text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Total XP · {level}</div>
          </div>
        </div>

      </div>
    </CardShell>
  );
}

function RoadmapCard({ stats }: { stats: UserStats | null }) {
  const navigate = useNavigate();
  const completed = stats?.completedLessons ?? 0;
  // Simple mock progress for now based on completed lessons
  // Assuming ~20 lessons for Unit 1
  const progress = Math.min(Math.round((completed / 20) * 100), 100);

  return (
    <CardShell className="roadmap-card bento-full text-secondary cursor-pointer hover:border-primary/50" onClick={() => navigate('/dashboard/roadmap')}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <Route size={18} color="white" />
          <span className="fw-semibold small text-uppercase tracking-tight">
            Roadmap
          </span>
        </div>
        <span className="small text-light">Unit 1 · {progress}%</span>
      </div>

      <div className="roadmap-track mt-3">
        <div className="roadmap-track-fill bg-gradient-to-r from-primary to-purple-500" style={{ width: `${progress}%` }} />

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

      <div className="d-flex justify-content-between mt-3 small text-secondary" style={{ fontSize: '0.75rem' }}>
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
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

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

    // Fetch Daily Challenge
    fetch("http://localhost:8000/api/challenge/daily")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Failed to load daily challenge");
      })
      .then(data => {
        setDailyChallenge(data.lesson);
        setChallengeCompleted(data.isCompletedToday);
      })
      .catch(err => console.error(err));


    return () => unsubscribe();
  }, []);

  return (
    <div className="left-dashboard px-4 pb-4 text-secondary">
      <div className="bento-grid">
        <ChallengeCard isCompleted={challengeCompleted} lesson={dailyChallenge} />
        <StatsCard user={user} stats={stats} />
        <RoadmapCard stats={stats} />
      </div>
    </div>
  );
}
