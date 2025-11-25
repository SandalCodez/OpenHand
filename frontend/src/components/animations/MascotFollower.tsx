// src/components/animations/DownMascotFollower.tsx
import React, { useEffect, useRef } from "react";

import DownMascotAnimation from "./DownMascotAnimation";

type DownMascotFollowerProps = {
  size?: number;
  className?: string;
  minDistance?: number;    // how close mirrored target can be to mouse
  stiffness?: number;      // spring strength
  damping?: number;        // 0–1, higher = more friction
  maxTiltDeg?: number;
};

export default function DownMascotFollower({
  size = 220,
  className = "",
  minDistance = 190,
  stiffness = 0.08,
  damping = 0.82,
  maxTiltDeg = 14,
}: DownMascotFollowerProps) {
  const mascotRef = useRef<HTMLDivElement | null>(null);

  const startX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const startY = typeof window !== "undefined" ? window.innerHeight / 3 : 0;

  const posRef = useRef({ x: startX, y: startY });
  const velRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ ...posRef.current });

  // mouse → update target (mirrored across screen center)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const mx = e.clientX;
      const my = e.clientY;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // mirror mouse across screen center
      let tx = centerX - (mx - centerX); // 2*centerX - mx
      let ty = centerY - (my - centerY); // 2*centerY - my

      // keep a minimum distance from the actual mouse, so it never overlaps
      const dxm = tx - mx;
      const dym = ty - my;
      const dist = Math.hypot(dxm, dym) || 1;
      if (dist < minDistance) {
        const factor = minDistance / dist;
        tx = mx + dxm * factor;
        ty = my + dym * factor;
      }

      // clamp inside viewport with some margin
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
        const dt = 16; // ~60fps

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

        // tilt based on horizontal velocity
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
        <DownMascotAnimation size={size} />
      </div>
    </div>
  );
}
