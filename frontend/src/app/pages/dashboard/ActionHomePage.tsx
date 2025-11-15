import "./ActionHomePage.css"
import { useOutletContext } from 'react-router-dom';
import {FaBookOpen} from "react-icons/fa"
import Camera from "../../../components/camera/Camera";
import AslWebcamSender from "../../../components/AslWebcamSender";


import { useState } from "react";
import { BookOpen, Hand, Route } from "lucide-react";
import InfoButton from "../../../components/progress/InfoButton";
import HandLandmarks from "../../../components/handlandmarks/HandLandmarks";

type TabKey = "Road" | "classes";

export default function ActionHomePage() {
const context = useOutletContext<{ user: any }>(); 
const user = context?.user;
// tab state for switching between "Road" and "classes"
const [tab, setTab] = useState<TabKey>("Road");
// toggle between camera view and landmarks view
const [view, setView] = useState<"camera" | "landmarks">("landmarks");
  console.log('Current user in ActionHimePage', user)
  return (
    <div className="row g-0 min-vh-100">
      {/* LEFT */}
      <div className="col-12 col-lg-6 position-relative">
        {/* topbar pinned inside the left column */}
        <div className="left-topbar-abs">
          <div className="container-fluid px-2">
            <div className="row align-items-center gx-2">
              {/* col-2: mascot */}
              <div className="col-2 d-flex align-items-center">
                <img
                  src="../mascot-smiling.png"
                  alt="Mascot"
                  className="topbar-mascot"
                />
              </div>

              {/* col-8: centered button group */}
              <div className="col-8 d-flex justify-content-center">
                <div className="btn-group xp-tabs">
                  <button
                    type="button"
                    className={`btn btn-sm  ${tab === "Road" ? "btn-light" : "btn-outline-light"}`}
                    onClick={() => setTab("Road")}
                  >
                    <Route size={16} className="me-1" /> Your Road
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm  ${tab === "classes" ? "btn-light" : "btn-outline-light"}`}
                    onClick={() => setTab("classes")}
                  >
                    <BookOpen size={16} className="me-1" /> Classes
                  </button>
                </div>
              </div>

              {/* col-2: info button aligned to the right */}
              <div className="col-2 d-flex justify-content-end">
                <InfoButton placement="left" />
              </div>
            </div>
          </div>
        </div>

        {/* center content */}
        <div className="h-100 d-flex align-items-center justify-content-center">
          <h1 className="display-6 text-light m-0">your lesson here</h1>
        </div>
      </div>

{/* RIGHT */}
<div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border-start border-1 border-light py-3">
  {/* content area */}
  <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
      <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
          <AslWebcamSender wsUrl="ws://localhost:8000/ws" mode="letters" />
      </div>
  </div>

  {/* toggle */}
  <div className="mt-3">
    <div className="btn-group">
      <button
        type="button"
        className={`btn btn-sm ${view === "camera" ? "btn-light" : "btn-outline-light"}`}
        onClick={() => setView("camera")}
      >
        Camera
      </button>
      <button
        type="button"
        className={`btn btn-sm ${view === "landmarks" ? "btn-light" : "btn-outline-light"}`}
        onClick={() => setView("landmarks")}
      >
        Landmarks
      </button>
    </div>
  </div>
</div>
    </div>
  );
}