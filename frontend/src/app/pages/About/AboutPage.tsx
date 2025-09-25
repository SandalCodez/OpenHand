import { Link } from "react-router-dom";
import "./AboutBento.css";
import Squares from "../../../components/squares/Squares";
import { useEffect } from "react";
export default function AboutPage() {

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
    <section className=" text-white border-top border-bottom border-1 border-white">
           <Squares
                speed={0.1}
                squareSize={25}
                direction='up' // up, down, left, right, diagonal
                borderColor='#2a2a2aff'
                hoverFillColor='#00a6ffff'
            />
      <div className="container py-5">
        <div className="bento-grid">

          {/* Big mission tile */}
          <div className="tile tile-hero border border-white rounded-4 p-4 p-lg-5">
         
            <span className="text-uppercase small opacity-75">About us</span>
            <h2 className="display-5 fw-semibold mt-2">Learn faster, smile more.</h2>
            <p className="lead opacity-90 mt-2 mb-4">
              We craft playful, effective learning experiences clear interfaces,
              smooth interactions, and zero fluff. Our goal is a product that
              feels friendly and stays out of your way.
            </p>
            <div className="d-flex gap-2">
              <Link to="/signup" className="btn btn-outline-light rounded-pill px-4">Get Started</Link>
            </div>
          </div>

          {/* Illustration / image tile */}
          <div className="tile tile-illustration border border-white rounded-4 p-0 overflow-hidden">
            <div className="h-100 d-flex align-items-center justify-content-center bg-liquid-glass">
              {/* replace src with your own image/mascot */}
              <img src="/mascot-smiling.png" alt="Mascot/Illustration" className="img-fluid p-4" />
            </div>
          </div>

          {/* Values tile */}
          <div className="tile tile-values border border-white rounded-4 p-4">
            <h3 className="h4 mb-3">What we value</h3>
            <ul className="list-unstyled mb-0">
              <li className="d-flex mb-2">
                <span className="dot me-2 mt-2" />
                <span>Human-centered design and accessible patterns.</span>
              </li>
              <li className="d-flex mb-2">
                <span className="dot me-2 mt-2" />
                <span>Clarity over cleverness—content first.</span>
              </li>
              <li className="d-flex">
                <span className="dot me-2 mt-2" />
                <span>Fast feedback loops and continuous improvement.</span>
              </li>
            </ul>
          </div>

          {/* How it works tile */}
          <div className="tile tile-process border border-white rounded-4 p-4">
            <h3 className="h4 mb-3">How it works</h3>
            <p className="mb-2">
              Pick a path, set a daily target, and practice in short,
              focused sessions. Your progress syncs across devices.
            </p>
            <p className="mb-0">
              We adapt difficulty automatically so you stay in the flow               never bored, never overwhelmed.
            </p>
          </div>

          {/* Quote / tone tile */}
          <div className="tile tile-quote border border-white rounded-4 p-4 p-lg-5">
            <blockquote className="blockquote mb-0">
              <p className="mb-3">
                “Good tools feel invisible. You stay with the problem,
                not the interface.”
              </p>
              <footer className="blockquote-footer text-white-50">
                The Team, in our design notes
              </footer>
            </blockquote>
          </div>

          {/* CTA tile */}
          <div className="tile tile-cta border border-white rounded-4 p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h3 className="h4 mb-1">Ready to explore?</h3>
              <p className="mb-0 opacity-90">
                Start with a quick onboarding—no credit card, no pressure.
              </p>
            </div>
            <Link to="/signup" className="btn btn-outline-light rounded-pill px-4">Create account</Link>
          </div>

        </div>
      </div>
    </section>
  );
}
