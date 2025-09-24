import { useEffect } from "react";
import Squares from "../../../components/squares/Squares";
import SignInSignUp from "./SignInSignUp";

export default function SignInPage() {
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
       
    <div className="position-relative z-3 w-100">
 <Squares
        speed={0.2}
        squareSize={25}
        direction='down' // up, down, left, right, diagonal
        borderColor='#2a2a2aff'
        hoverFillColor='#00a6ffff'
    />
  <div className="container">
    <div className="row align-items-center justify-content-center min-vh-100">
      {/* Left: mascot image */}
      <div className="col-12 col-lg-6 d-flex justify-content-center mb-4 mb-lg-0 ">
        <img
          src="/MascotSmileClosedEyes.png"           // <-- change to your actual path
          alt="Mascot"
          className="img-fluid p-3"
          style={{ maxWidth: 700, height: 700  }}  // Adjust size as needed}}
        />
      </div>

      {/* Right: Sign in / Sign up */}
      <div className="col-12 col-lg-5 col-xl-4 d-flex justify-content-center p-3">
        <SignInSignUp />
      </div>
    </div>
  </div>
</div>
    </>


  );
}
