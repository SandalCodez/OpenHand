import "./ActionHomePage.css"
import { useOutletContext, useNavigate } from "react-router-dom";
import { useState } from "react";
import HandLandmarks from "../../../components/handlandmarks/HandLandmarks";
import LeftPanel from "../../../components/grid/LeftPanel";

// --- Main component --- //
export default function ActionHomePage() {
  const navigate = useNavigate();
  const context = useOutletContext<{ user: any; settings: { showCamera: boolean; handColor?: string } }>();
  const user = context?.user;
  const showCamera = context?.settings?.showCamera ?? true;
  const [view, setView] = useState<"camera" | "landmarks">("landmarks");

  console.log("Current user in ActionHomePage", user);

  return (
    <div className="row g-0 min-vh-100">
      {/* LEFT – DASHBOARD + MASCOT */}
      <LeftPanel user={user} />

      {/* RIGHT – camera / landmarks */}
      {showCamera ? (
        <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border-start border-1 border-secondary py-3">
          <div className="shadow-sm  text-info fw-light" role="alert">
            Try out the hand recognition here!
          </div>
          <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
            <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100">
              <HandLandmarks mode={view} color={context?.settings?.handColor} />
            </div>
          </div>
        </div>
      ) : (
        <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border-start border-1 border-secondary py-3">
          <div className="text-center p-5 rounded-4 bg-black bg-opacity-25 border border-secondary" style={{ backdropFilter: "blur(5px)" }}>
            <h4 className="text-light mb-3">Camera Disabled</h4>
            <p className="text-secondary mb-4">Enable the camera in settings to interact.</p>
            <button className="btn btn-outline-info" onClick={() => navigate("/dashboard/settings")}>
              Go to Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
