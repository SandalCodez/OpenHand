// src/app/pages/Home/SplashScreen.tsx
import { useEffect, useState } from "react";
import "./SplashScreen.css";

type Props = {
  text?: string;
  durationMs?: number;   // total time splash stays on
  fadeMs?: number;       // fade-out duration
  onDone?: () => void;   // called when splash fully finishes
};

export default function SplashScreen({
  text = "Open Hand",
  durationMs = 2000,
  fadeMs = 700,
  onDone,
}: Props) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), Math.max(0, durationMs - fadeMs));
    const doneTimer = setTimeout(() => onDone?.(), durationMs);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [durationMs, fadeMs, onDone]);

return (
  <div className={`splash-root ${fading ? "is-fading" : ""}`}>
    <div className="splash-content">
      <img
        src="./logo.png"   // ✅ replace with your image path
        alt="Open Hand Logo"
        className="splash-logo"
      />
      <h1 className="splash-title">{text}</h1>
    </div>
  </div>
);

}
