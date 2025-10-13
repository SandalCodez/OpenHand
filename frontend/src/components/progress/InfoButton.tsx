import React, { useEffect, useRef, useState } from "react";
import { CircleHelp } from "lucide-react"; // nicer info icon
import ProgressBento from "../progress/ProgressBento";
import "./InfoButton.css";

type Placement = "left" | "below-left" | "below-right";

type Props = {
  placement?: Placement;
  title?: string; // tooltip/title
};

const InfoButton: React.FC<Props> = ({ placement = "left", title = "Your progress" }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // close on outside click + Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="info-wrapper" aria-expanded={open}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen(v => !v)}
        aria-label={title}
        title={title}
      >
        <CircleHelp size={24} strokeWidth={2.25} aria-hidden="true" />
      </button>

      {open && (
        <div
          className={[
            "info-panel",
            placement === "left" ? "pos-left" : "",
            placement === "below-left" ? "pos-below-left" : "",
            placement === "below-right" ? "pos-below-right" : "",
            "animate-fade-in",
          ].join(" ")}
          role="dialog"
          aria-label="Progress"
        >
          <ProgressBento
            level={3}
            xp={1200}
            nextXp={2000}
            streakDays={7}
            lessonsCompleted={14}
          />
        </div>
      )}
    </div>
  );
};

export default InfoButton;
