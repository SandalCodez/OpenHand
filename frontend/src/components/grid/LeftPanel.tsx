import { useState } from "react";
import { X } from "lucide-react";
import MainMascotAnimation from "../animations/MainMascotAnimation";
import LeftDashboard from "./LeftDashboard";
import UserTab from "./usertab/UserTab";

type UserLike = {
  first_name?: string;
  name?: string;
};

type LeftPanelProps = {
  user?: UserLike;

};

function DailyMessageBubble({
  user,
  isVisible,
}: {
  user?: UserLike;
  isVisible: boolean;

}) {
  const name = user?.first_name || user?.name || "friend";

  return (
    <div
      className={`daily-message-bubble shadow-lg ${isVisible ? "is-visible" : ""
        }`}
      aria-hidden={!isVisible}
    >
      <p className="mb-1 fw-semibold">Hey {name}</p>
      <p className="mb-0 small text-light">
        Let’s pick up where you left off and grab one more sign today.
      </p>
    </div>
  );
}

function MascotStage({
  onHoverStart,
  onHoverEnd,
}: {
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  return (
    <div className="mascot-wrap position-relative d-flex flex-column align-items-center pt-2">

      {/* smaller hover radius – just the mascot */}
      <div
        className="mascot-hover-target"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        style={{ display: "inline-block", cursor: "pointer" }}
      >
        <MainMascotAnimation size={340} />
      </div>

      <div className="mascot-ground2" />

      <svg
        className="mascot-swiggle"
        width="130"
        height="28"
        viewBox="0 0 130 28"
      >
        <path
          className="swiggle-path"
          d="M5 14 C 25 2, 45 26, 65 14 C 85 2, 105 26, 125 14"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <svg
        className="mascot-swiggle2"
        width="130"
        height="28"
        viewBox="0 0 130 28"
      >
        <path
          className="swiggle-path"
          d="M5 14 C 25 2, 45 26, 65 14 C 85 2, 105 26, 125 14"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function LeftPanel({ user }: LeftPanelProps) {
  const [hoveringMascot, setHoveringMascot] = useState(false);

  return (
    <div className="col-12 col-lg-6 position-relative d-flex flex-column bg-custom-color-dark border-start border-1 border-secondary left-panel">
      <UserTab user={user} />
      <DailyMessageBubble user={user} isVisible={hoveringMascot} />

      <MascotStage
        onHoverStart={() => setHoveringMascot(true)}
        onHoverEnd={() => setHoveringMascot(false)}
      />

      <LeftDashboard />
    </div>
  );
}
