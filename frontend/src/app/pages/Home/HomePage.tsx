import { ChevronDown, MoveDownIcon } from 'lucide-react';
import DownMascotAnimation from '../../../components/animations/DownMascotAnimation';
import MainMascotAnimation from '../../../components/animations/MainMascotAnimation';
import RotatingText from '../../../components/animations/RotatingText';
import FeatureSection from '../../../components/sections/FeatureSection';
import SectionOne from '../../../components/sections/SectionOne';
import Squares from '../../../components/squares/Squares';
import usePageLeaveAnimation from "../../../components/animations/usePageLeaveAnimation";
import { useRef } from "react";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionTwo from '../../../components/sections/SectionTwo';
import SectionThree from '../../../components/sections/SectionThree';
import SectionFour from '../../../components/sections/SectionFour';

export default function HomePage() {

  const mascotRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const goWithAnimation = usePageLeaveAnimation();

  const triggerLoginFromHero = (e: React.MouseEvent) => {

    e.preventDefault();
    window.dispatchEvent(new Event("openhand:goLogin"));

  };

  useEffect(() => {
    const handleGoLogin = () => {
      goWithAnimation("/login", () => {
        if (textRef.current) {
          textRef.current.classList.add("fade-exit");
        }
        if (mascotRef.current) {
          mascotRef.current.classList.add("mascot-exit-right");
        }
      });
    };

    window.addEventListener("openhand:goLogin", handleGoLogin);
    return () => window.removeEventListener("openhand:goLogin", handleGoLogin);
  }, [goWithAnimation]);


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
      <div>
        <Squares
          speed={0.2}
          squareSize={28}
          direction="left" // up, down, left, right, diagonal
          borderColor="#232323ff"
          hoverFillColor="#00a6ffff"
        />
      </div>

      {/* HERO */}
      <div className="container position-relative ">
        <div
          className="row align-items-center"
          style={{ minHeight: '75vh', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}
        >
          {/* LEFT: mascots */}
          <div className="col-md-6 d-flex justify-content-center">
            <div
              className="position-relative d-flex flex-column align-items-center"
              style={{
                width: 480,
                height: 520,
                maxWidth: "100%",
              }}
            >
              {/* floating wrapper: mascot + board */}
              <div ref={mascotRef} className="mascot-wrap position-relative d-flex flex-column align-items-center">
                <MainMascotAnimation size={480} />

                {/* surfboard */}
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

              {/* flying sad hand (should NOT rotate) */}
              <div
                className="position-absolute fly z-3"
                style={{
                  left: "20%",
                  top: "45%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <DownMascotAnimation size={220} />
              </div>
            </div>


          </div>

          {/* RIGHT: headline + buttons */}
          <div ref={textRef} className="col-md-6 d-flex justify-content-center justify-content-md-start">
            <div className="text-center text-md-start">
              <h1 className="text-white mb-4 display-5 lh-sm">
                The{" "}
                <RotatingText
                  texts={['Easy', 'Cool', 'Fun']}
                  mainClassName="justify-center rounded-lg btn btn-outline-success rounded-5 fs-1 px-3 py-2"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={3000}
                />{" "}
                way to learn sign language!
              </h1>

              <div className="row justify-content-center justify-content-md-start g-2">
                <div className="col-12 col-sm-10 col-md-9 col-lg-7">
                  <a className="btn btn-light btn-lg rounded-pill w-100 mb-2">
                    Get Started
                  </a>
                  <a
                    className="btn btn-outline-light btn-lg rounded-pill w-100"
                    onClick={triggerLoginFromHero}
                  >
                    I Already Have An Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="align-center text-center mb-4">
          <a href="#next-section" className="scroll-down-btn ">
            scroll down <ChevronDown className="scroll-icon" />
          </a>
        </div>
      </div>
      {/* FEATURES */}
      <div id='next-section'>
        <FeatureSection />
      </div>
      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
    </>
  );
}
