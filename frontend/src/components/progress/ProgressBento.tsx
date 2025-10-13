import React from "react";
import { Target, Award, BookOpen } from "lucide-react";
import "./ProgressBento.css";

type ProgressBentoProps = {
  level: number;
  xp: number;
  nextXp: number;
  streakDays: number;
  lessonsCompleted: number;
  className?: string;
};

const ProgressBento: React.FC<ProgressBentoProps> = ({
  level,
  xp,
  nextXp,
  streakDays,
  lessonsCompleted,
  className,
}) => {
  const pct = Math.max(0, Math.min(100, Math.round((xp / nextXp) * 100)));

  return (
    <section className={["bento-mini", className ?? ""].join(" ").trim()}>
      {/* Tile: Level / XP */}
      <div className="bm-tile bm-level">
        <div className="bm-head">
          <Target size={14} />
          <span>Current Goal</span>
        </div>
        <div className="bm-title">Level {level}</div>
        <div className="bm-sub text-secondary small mb-2">
          {xp} / {nextXp} XP
        </div>
        <div className="progress" style={{ height: 6 }}>
          <div className="progress-bar bg-success" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tile: Streak */}
      <div className="bm-tile bm-streak">
        <div className="bm-row">
          <Award size={14} />
          <div>
            <div className="bm-label">Streak</div>
            <div className="bm-value">{streakDays} days</div>
          </div>
        </div>
      </div>

      {/* Tile: Lessons */}
      <div className="bm-tile bm-lessons">
        <div className="bm-row">
          <BookOpen size={14} />
          <div>
            <div className="bm-label">Lessons completed</div>
            <div className="bm-value">{lessonsCompleted}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressBento;
