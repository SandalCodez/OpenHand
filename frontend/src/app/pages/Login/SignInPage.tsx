import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Squares from "../../../components/squares/Squares";
import SignInSignUp from "./SignInSignUp";
import AnimatedMascot from "../../../components/animations/AnimatedMascot";

export default function SignInPage() {
  const location = useLocation();
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".squares-canvas");
    if (!canvas) return;
    const forwardMove = (e: MouseEvent) => {
      canvas.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: true,
          cancelable: false,
          view: window,
        })
      );
    };
    const forwardLeave = () => {
      canvas.dispatchEvent(
        new MouseEvent("mouseleave", { bubbles: true, cancelable: false, view: window })
      );
    };
    window.addEventListener("mousemove", forwardMove);
    window.addEventListener("mouseleave", forwardLeave);
    return () => {
      window.removeEventListener("mousemove", forwardMove);
      window.removeEventListener("mouseleave", forwardLeave);
    };
  }, []);

  return (
    <>
      <div className="signin-page position-relative">
        {/* Background squares grid */}
        <Squares
          speed={0.2}
          squareSize={28}
          direction="left" // up, down, left, right, diagonal
          borderColor="#232323ff"
          hoverFillColor="#00a6ffff"
        />


        {/* content on top of grid */}
        <div className="position-relative z-3">
          <div className="container" style={{ maxWidth: "1100px" }}>
            <div className="row align-items-center justify-content-center g-5  py-5">
              {/* Left: mascot */}
              <div className="col-12 col-lg-5 d-flex justify-content-lg-end mascot-animation justify-content-center">
                <div className=" mascot-wrap mascot-enter position-relative d-flex flex-column align-items-center ">
                  <AnimatedMascot size={480} />
                  <div className="mascot-ground" />
                  <svg className="mascot-swiggle" width="130" height="28" viewBox="0 0 130 28">
                    <path
                      className="swiggle-path"
                      d="M5 14 C 25 2, 45 26, 65 14 C 85 2, 105 26, 125 14"
                      stroke="white"
                      strokeWidth="1"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <svg className="mascot-swiggle2" width="130" height="28" viewBox="0 0 130 28">
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
              </div>

              {/* Right: Sign in / Sign up */}
              <div className="col-12 col-lg-5 d-flex justify-content-lg-start justify-content-center px-3">
                <SignInSignUp initialAction={new URLSearchParams(location.search).get("mode") === "signup" ? "active" : ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
