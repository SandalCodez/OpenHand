import SectionOne from '../../../components/sections/SectionOne';
import Squares from '../../../components/squares/Squares';
import { useEffect } from 'react';

export default function HomePage() {

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
  
    return (<>
    <div className=" ">
        <Squares 
        speed={0.2} 
        squareSize={25}
        direction='right' // up, down, left, right, diagonal
        borderColor='#2a2a2aff'
        hoverFillColor='#00a6ffff'
        />
    </div>
    <div className="container">
    <div className="row">
        <div className="col-md-6">
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <img src='mascot-smiling.png' alt='Mascot Smiling' style={{ maxWidth: '700px', height: '700px' }} />
            </div>
        </div>
                <div className="col-md-6">
            <div className="d-flex justify-content-center align-items-center min-vh-100">
  <div className="text-center">
    <h1 className="text-white pb-4 display-5">The free, fun, and effective way to learn sign language!</h1>

    <div className="row justify-content-center g-2">
      {/* constrain width with responsive cols */}
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 ">
        <a className="btn btn-light btn-lg rounded-pill w-100 mb-2">Get Started</a>
        <a className="btn btn-outline-light btn-lg rounded-pill w-100">I Already Have An Account</a>
      </div>
    </div>
  </div>
</div>
        </div>
    </div>
    </div>

      <SectionOne
      />
    </>);
}


