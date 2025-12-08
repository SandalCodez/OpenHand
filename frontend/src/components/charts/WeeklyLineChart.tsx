// src/components/charts/WeeklyLineChart.tsx
import React from "react";

type Series = {
  label: string;
  data: number[]; // length 7
  colorClass: string; // Bootstrap/text class for legend dot (e.g. "text-info")
  stroke: string;     // actual stroke color (CSS var or hex)
};

type Props = {
  series: Series[];        // 1–2 lines (you can pass more)
  maxY?: number;           // y-axis max, default auto from data (rounded up)
  height?: number;         // svg height (px)
  showLegend?: boolean;
  rightSummary?: React.ReactNode; // e.g. "36 lessons"
};

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export default function WeeklyLineChart({
  series,
  maxY,
  height = 180,
  showLegend = true,
  rightSummary,
}: Props) {
  const width = 520;
  const padding = { t: 16, r: 12, b: 28, l: 24 };

  const all = series.flatMap(s => s.data);
  const rawMax = all.length ? Math.max(...all) : 1;
  const yMax = maxY ?? Math.max(5, Math.ceil(rawMax / 5) * 5);

  const chartW = width - padding.l - padding.r;
  const chartH = height - padding.t - padding.b;

  const x = (i: number) => (chartW / 6) * i + padding.l;
  const y = (v: number) => padding.t + chartH * (1 - clamp(v / yMax, 0, 1));

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const gridYs = [0, yMax / 3, (2 * yMax) / 3, yMax];

  return (
    <div className="card bg-transparent text-white border border-secondary  rounded-4">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex align-items-center gap-3">
            {showLegend &&
              series.map((s) => (
                <div key={s.label} className="d-flex align-items-center gap-2">
                  <span className={`fs-5 ${s.colorClass}`}>●</span>
                  <span className="small text-white-50">{s.label}</span>
                </div>
              ))}
          </div>
          {rightSummary && <div className="small text-white fw-semibold">{rightSummary}</div>}
        </div>

        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-100">
          {/* grid lines */}
          {gridYs.map((gy, idx) => (
            <g key={idx}>
              <line
                x1={padding.l}
                x2={width - padding.r}
                y1={y(gy)}
                y2={y(gy)}
                stroke="rgba(255,255,255,.12)"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* lines */}
          {series.map((s, si) => {
            const d = s.data
              .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`)
              .join(" ");
            return (
              <g key={si}>
                <path d={d} fill="none" stroke={s.stroke} strokeWidth={3} />
                {s.data.map((v, i) => (
                  <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={s.stroke} />
                ))}
              </g>
            );
          })}

          {/* x labels */}
          {labels.map((lab, i) => (
            <text
              key={lab + i}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize="12"
              fill="rgba(255,255,255,.35)"
            >
              {lab}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
