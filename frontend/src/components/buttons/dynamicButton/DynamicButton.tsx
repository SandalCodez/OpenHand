import React, { useRef, useState } from "react";
import "./DynamicButton.css"; // side-effect import, not a module

type DynamicButtonProps = {
  children: React.ReactNode;
  className?: string;
};

type HoverDir = "left" | "right";

const DynamicButton: React.FC<DynamicButtonProps> = ({ children, className }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [hoverDir, setHoverDir] = useState<HoverDir>("left");
  const [hovering, setHovering] = useState(false);

  const getDirection = (e: React.MouseEvent<HTMLButtonElement>): HoverDir => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return "left";
    return e.clientX - rect.left < rect.width / 2 ? "left" : "right";
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setHoverDir(getDirection(e));
    setHovering(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setHoverDir(getDirection(e));
    setHovering(false);
  };

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        "dynamicButton",         // ← global class from your CSS
        "rounded-5",
        hoverDir,                // "left" or "right"
        hovering ? "hovering" : "",
        className ?? "",
      ].join(" ").trim()}
    >
      <span>{children}</span>
    </button>
  );
};

export default DynamicButton;
