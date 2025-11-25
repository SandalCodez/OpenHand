// src/components/animations/DownMascotFollower.tsx
import React, { useEffect, useRef } from "react";
import DownMascotAnimation from "./DownMascotAnimation";
import MainMascotAnimation from "./MainMascotAnimation";

type DownMascotFollowerProps = {
  size?: number;
  className?: string;
  minDistance?: number;    // how close mouse can get before it runs
  stiffness?: number;      // spring strength
  damping?: number;        // 0–1, higher = more friction
  maxTiltDeg?: number;
};

export default function DownMascotFollower({
  size = 220,
  className = "",
  minDistance = 240,
  stiffness = 0.08,
  damping = 0.82,
  maxTiltDeg = 14,
}: DownMascotFollowerProps) {
  const mascotRef = useRef<HTMLDivElement | null>(null);

  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
  const velRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ ...posRef.current });

  // mouse → update target
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const mx = e.clientX;
      const my = e.clientY;

      const { x: cx, y: cy } = posRef.current;
      const dx = cx - mx;
      const dy = cy - my;
      const dist = Math.hypot(dx, dy) || 1;

      let tx = mx;
      let ty = my;

      if (dist < minDistance) {
        // too close → target is pushed away from mouse
        const factor = minDistance / dist;
        tx = mx + dx * factor;
        ty = my + dy * factor;
      } else {
        // follow but not right on top of cursor
        tx = mx + dx * 0.3;
        ty = my + dy * 0.1;
      }

      const margin = 80;
      tx = Math.min(window.innerWidth - margin, Math.max(margin, tx));
      ty = Math.min(window.innerHeight - margin, Math.max(margin, ty));

      targetRef.current = { x: tx, y: ty };
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [minDistance]);

  // spring animation loop
  useEffect(() => {
    let frameId: number;
    const start = performance.now();

    const animate = (time: number) => {
      const mascot = mascotRef.current;
      if (mascot) {
        const dt = 16; // assume ~60fps

        const pos = posRef.current;
        const vel = velRef.current;
        const tgt = targetRef.current;

        // spring force toward target
        const fx = (tgt.x - pos.x) * stiffness;
        const fy = (tgt.y - pos.y) * stiffness;

        vel.x = vel.x * damping + fx * (dt / 16);
        vel.y = vel.y * damping + fy * (dt / 16);

        pos.x += vel.x;
        pos.y += vel.y;

        posRef.current = pos;
        velRef.current = vel;

        // tiny idle bob
        const t = (time - start) * 0.002;
        const bobY = Math.sin(t) * 4;

        // tilt based on velocity
        const tiltRaw = (vel.x / 10) * maxTiltDeg;
        const tilt = Math.max(-maxTiltDeg, Math.min(maxTiltDeg, tiltRaw));

        mascot.style.transform = `translate(${pos.x}px, ${
          pos.y + bobY
        }px) translate(-50%, -50%) rotate(${tilt}deg)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [stiffness, damping, maxTiltDeg]);

  return (
    <div className={`down-mascot-overlay ${className}`.trim()}>
      <div ref={mascotRef} className="down-mascot-chaser">
        <MainMascotAnimation size={size} />
        {/* surfboard */}
        <div className="mascot-ground3" />
        <svg className="mascot-swiggle3" width="60" height="28" viewBox="0 0 130 28">
          <path
            className="swiggle-path"
            d="M5 14 C 25 2, 45 26, 65 14 C 85 2, 105 26, 125 14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <svg className="mascot-swiggle" width="60" height="28" viewBox="0 0 130 28">
          <path
            className="swiggle-path"
            d="M5 14 C 25 2, 45 26, 65 14 C 85 2, 105 26, 125 14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
