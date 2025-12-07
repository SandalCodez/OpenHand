import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Star, Lock } from "lucide-react";
import "./RoadMap.css";
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
  isActive?: boolean;
};

type Props = {
  lessons: LessonNode[];
  currentIndex: number;
  userXP: number;
  compact?: boolean;
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

export default function RoadMapStair({ lessons, currentIndex, userXP, compact = true }: Props) {
  const nav = useNavigate();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const ordered = useMemo(() => sortLessons(lessons), [lessons]);

  // Road generation logic
  const ROW_H = 150; // Visual height per row
  const totalHeight = ordered.length * ROW_H;

  const points = ordered.map((_, i) => {
    const posIndex = i % 4;
    let xPer = 50;
    if (posIndex === 0) xPer = 16.666; // Left (col-md-4 offset-0 center is roughly 16%)
    if (posIndex === 1) xPer = 50;     // Center (col-md-4 offset-4 center is 50%)
    if (posIndex === 2) xPer = 83.333; // Right (col-md-4 offset-8 center is roughly 83%)
    if (posIndex === 3) xPer = 50;     // Back to Center

    // adjust Y to be in the center of the row
    const y = i * ROW_H + (ROW_H / 2);
    return { x: xPer, y };
  });

  // Construct Path
  let d = "";
  if (points.length > 0) {
    d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midY = (curr.y + next.y) / 2;
      // Cubic bezier: Control points vertically between nodes to create smooth S-curves
      d += ` C ${curr.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
    }
  }

  return (
    <>
      {/* Mascot at top */}
      <DownMascotFollower size={300} stiffness={0.1} damping={0.78} maxTiltDeg={18} />

      {/* Background interactive mascot (if desired) */}
      <MascotFollower />

      <div className="container p-0 pb-5 position-relative">

        {/* ROAD SVG LAYER */}
        <svg
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ pointerEvents: 'none', zIndex: -1, height: totalHeight }}
          viewBox={`0 0 100 ${totalHeight}`}
          preserveAspectRatio="none"
        >
          {/* Road Border/Glow (optional) */}
          <path d={d} fill="none" stroke="#6936b6ff" strokeWidth="52" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.3" />

          {/* Thick Purple Road Base */}
          <path d={d} fill="none" stroke="#582ba6ff" strokeWidth="48" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

          {/* White Dashed Center Line */}
          <path d={d} fill="none" stroke="white" strokeWidth="4" strokeDasharray="10 15" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.9" />
        </svg>

        {ordered.map((l, idx) => {
          const isUnlocked = userXP >= l.xpNeeded;
          const disabled = !isUnlocked;

          // Determine label position based on ZigZag
          const pos = ZIG_POS[idx % ZIG_POS.length];
          const badgeLeft = pos === 8;

          return (

            <div className="row g-4 position-relative m-0" key={`${l.id}-${idx}`} style={{ height: `${ROW_H}px` }}>
              <div className={`col-12 col-md-4 ${offsetClass(idx)} position-relative d-flex justify-content-center align-items-center`}>

                <button
                  className={`btn rounded-circle d-flex align-items-center justify-content-center position-relative shadow-lg transition-transform hover-scale`}
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: isUnlocked ? '#0dcaf0' : '#374151', // Info (Light Blue) vs Gray
                    border: isUnlocked ? '4px solid #ffffff' : '4px solid #4b5563',
                    zIndex: 1
                  }}
                  disabled={disabled}
                  onClick={() => !disabled && nav(`/dashboard/claim-badge/${l.xpNeeded}`)}
                  onMouseEnter={() => setHoverId(l.id)}
                  onMouseLeave={() => setHoverId(id => (id === l.id ? null : id))}
                  title={l.title}
                >
                  {isUnlocked ? (
                    <span className="fw-bold text-dark fs-4">{idx + 1}</span>
                  ) : (
                    <Lock size={24} className="text-secondary" />
                  )}

                  {/* Floating Label */}
                  <div className={`position-absolute top-50 ${badgeLeft ? 'end-100 me-3' : 'start-100 ms-3'} translate-middle-y`} style={{ minWidth: '150px', whiteSpace: 'nowrap', textAlign: badgeLeft ? 'right' : 'left' }}>
                    <div className={`badge ${isUnlocked ? 'bg-info text-dark' : 'bg-secondary'}`}>{l.title}</div>
                    <div className="small text-white mt-1 fw-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      {isUnlocked ? 'Unlocked' : `${l.xpNeeded} XP needed`}
                    </div>
                  </div>

                </button>

                {hoverId === l.id && (
                  <div className="position-absolute bottom-100 start-50 translate-middle-x mb-2 p-3 bg-dark border border-secondary rounded-3 shadow-lg" style={{ width: '200px', zIndex: 10 }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-white">{l.title}</strong>
                    </div>
                    <div className="text-white-50 small mb-2">{l.questions} questions</div>
                    <div className="d-flex align-items-center gap-2 small text-light">
                      <Star size={14} className="text-warning" />
                      <span>{userXP} / {l.xpNeeded} XP Need</span>
                    </div>
                    <div className="text-end small mt-1 fw-bold">
                      {isUnlocked ? <span className="text-info">UNLOCKED</span> : <span className="text-secondary">LOCKED</span>}
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
