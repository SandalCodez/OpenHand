import "./ActionHomePage.css"
import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import HandLandmarks from "../../../components/handlandmarks/HandLandmarks";
import LeftPanel from "../../../components/grid/LeftPanel";

// --- Main component --- //
export default function ActionHomePage() {
  const context = useOutletContext<{ user: any }>();
  const user = context?.user;
  const [view, setView] = useState<"camera" | "landmarks">("landmarks");

  console.log("Current user in ActionHomePage", user);

  return (
    <div className="row g-0 min-vh-100">
      {/* LEFT – DASHBOARD + MASCOT */}
      <LeftPanel user={user} />

      {/* RIGHT – camera / landmarks */}
      <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border-start border-1 border-secondary py-3">
        <div className="shadow-sm  text-secondary  fw-light" role="alert">
          Try out the hand recognition here!
        </div>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
          <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
            <HandLandmarks mode={view} />
          </div>
        </div>
      </div>
    </div>
  );
}
