import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Star } from "lucide-react";
import "./RoadMap.css"; // same file as before
import DownMascotAnimation from "../animations/DownMascotAnimation";
import DownMascotFollower from "../animations/DownMascotFollower";
import MascotFollower from "../animations/MascotFollower";

export type LessonNode = {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  questions: number;
  xp: number;
  xpNeeded: number;
  order?: number;
};

type Props = {
  lessons: LessonNode[];
  currentIndex: number;
  compact?: boolean; // new: tighter node style
};

function sortLessons(lessons: LessonNode[]) {
  const allHaveOrder = lessons.every(l => typeof l.order === "number");
  return allHaveOrder
    ? [...lessons].sort((a, b) => (a.order! - b.order!) || a.title.localeCompare(b.title))
    : lessons.slice();
}

// Zig-zag pattern across 3 columns: L → C → R → C (repeat)
const ZIG_POS = [0, 4, 8, 4]; // Bootstrap offsets for md grid (0, 4, 8, 4, 0, 4, 8, 4, ...)
function offsetClass(idx: number) {
  const off = ZIG_POS[idx % ZIG_POS.length];
  return `offset-md-${off}`;
}

export default function RoadMapStair({ lessons, currentIndex, compact = true }: Props) {
  const nav = useNavigate();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const ordered = useMemo(() => sortLessons(lessons), [lessons]);
  const safeIndex = Math.max(0, Math.min(currentIndex, Math.max(0, ordered.length - 1)));

  return (
    <>
    
    <DownMascotFollower size={300} stiffness={0.1} damping={0.78} maxTiltDeg={18} />

    <MascotFollower ></MascotFollower>

    <div className="container p-0">

      
      {ordered.map((l, idx) => {
        const state = idx < safeIndex ? "passed" : idx === safeIndex ? "current" : "locked";
        const disabled = state === "locked";
        const pct = Math.min(100, Math.round((l.xp / Math.max(1, l.xpNeeded)) * 100));

        // for visual polish: put the level badge on the "outer" side
        const pos = ZIG_POS[idx % ZIG_POS.length]; // 0 = left, 4 = center, 8 = right
        const badgeLeft = pos === 8;  // when on right column, place badge at left side
        const badgeRight = pos !== 8; // otherwise keep it at right

        return (
          
          <div className="row g-4 mb-2 p-5" key={`${l.id}-${idx}`}>
            <div className={`col-12 col-md-4 ${offsetClass(idx)} position-relative`}>
              <button
                className={`rm-node ${compact ? "rm-compact" : ""} btn btn-outline-light rounded-5 w-100 d-flex align-items-center justify-content-between ${state}`}
                disabled={disabled}
                onClick={() => !disabled && nav(`/dashboard/actionHome`)}
                onMouseEnter={() => setHoverId(l.id)}
                onMouseLeave={() => setHoverId(id => (id === l.id ? null : id))}
                title={l.title}
              >
                {/* left cluster */}
                <span className="d-inline-flex align-items-center gap-2">
                  <Home size={18} />
                  <span className="rm-title">{l.title}</span>
                </span>

                {/* badge cluster (auto swap side for nicer zig zag) */}
                <span className={`badge rm-level ${badgeRight ? "" : "me-auto"}`}>
                  {l.level}
                </span>
              </button>

              {hoverId === l.id && (
                <div className="rm-card border border-white rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="me-4">{l.title}</strong>
                    <span className="badge rm-level">{l.level}</span>
                  </div>
                  <div className="text-muted small mb-2">{l.questions} questions</div>
                  <div className="d-flex align-items-center gap-2 small">
                    <Star size={14} />
                    <span>{l.xp} / {l.xpNeeded} XP</span>
                  </div>
                  <div className="rm-xpbar mt-1">
                    <div className="rm-xpfill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-end small mt-1">
                    {state === "passed" ? "Passed" : state === "current" ? "Current" : "Locked"}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
