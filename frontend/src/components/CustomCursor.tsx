// src/components/CustomCursor.tsx
import { useEffect, useRef } from "react";

export default function CustomCursor({
  color = "#ff2b2b",
  size = 14,
  hoverScale = 10,
  downScale = 0.9,
  interactiveSelectors = 'a,button,[role="button"],[data-cursor="interactive"]'
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(1);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    // wrapper: only for position — NO transition
    const wrap = document.createElement("div");
    wrap.id = "custom-cursor-wrap";
    Object.assign(wrap.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${size}px`,
      height: `${size}px`,
      pointerEvents: "none",
      zIndex: "99999",
      transform: `translate3d(-9999px, -9999px, 0)`,
      willChange: "transform"
    } as CSSStyleDeclaration);
    document.body.appendChild(wrap);
    wrapRef.current = wrap;

    // inner: draws the red circle — transition ONLY on scale
    const inner = document.createElement("div");
    Object.assign(inner.style, {
      width: "100%",
      height: "100%",
      borderRadius: "25%",
      background: color,
      transform: "scale(1)",
      transition: "transform 120ms ease, background-color 120ms ease, border-color 120ms ease",
      willChange: "transform",
      border: `1px solid ${color}`,
      borderColor: "transparent",
      boxSizing: "border-box"
    } as CSSStyleDeclaration);
    wrap.appendChild(inner);
    innerRef.current = inner;

    const body = document.body;
    body.classList.add("has-custom-cursor");

    let x = -9999, y = -9999;

    const move = (e: PointerEvent) => {
      x = e.clientX - size / 2;
      y = e.clientY - size / 2;
      if (wrapRef.current) {
        // instant position update — no transition
        wrapRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && t.closest(interactiveSelectors) !== null;

    const applyScale = (s: number, isHover: boolean) => {
      scaleRef.current = s;
      if (innerRef.current) {
        innerRef.current.style.transform = `scale(${s})`;
        if (isHover) {
          innerRef.current.style.backgroundColor = "transparent";
          innerRef.current.style.borderColor = color;
          // Adjust border width to counteract scaling so it doesn't look too thick
          // 2px / s roughly keeps it looking like a normal border
          innerRef.current.style.borderWidth = `${2 / s}px`;
        } else {
          innerRef.current.style.backgroundColor = color;
          innerRef.current.style.borderColor = "transparent";
        }
      }
    };

    const onOver = (e: Event) => isInteractive(e.target) && applyScale(hoverScale, true);
    const onOut = (e: Event) => isInteractive(e.target) && applyScale(1, false);
    const onDown = () => applyScale(downScale, false);
    const onUp = () => {
      const elUnder = document.elementFromPoint(x + size / 2, y + size / 2);
      const interactive = isInteractive(elUnder);
      applyScale(interactive ? hoverScale : 1, interactive);
    };

    const onVisibility = () => {
      if (!wrapRef.current) return;
      wrapRef.current.style.opacity = document.visibilityState === "visible" ? "1" : "0";
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      document.removeEventListener("visibilitychange", onVisibility);
      body.classList.remove("has-custom-cursor");
      if (wrapRef.current) wrapRef.current.remove();
      wrapRef.current = null;
      innerRef.current = null;
    };
  }, [color, size, hoverScale, downScale, interactiveSelectors]);

  return null;
}
