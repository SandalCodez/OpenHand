import "./ActionHomePage.css"
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import HandLandmarks from "../../../components/handlandmarks/HandLandmarks";
import LeftPanel from "../../../components/grid/LeftPanel";
import { SettingsManager } from "../../../services/SettingsManager";
import { CameraOff } from "lucide-react";

// --- Main component --- //
export default function ActionHomePage() {
  const context = useOutletContext<{ user: any }>();
  const user = context?.user;
  // const [view, setView] = useState<"camera" | "landmarks">("landmarks");
  const view = "landmarks"; // Fixed view for now or derived if needed
  const [showCamera, setShowCamera] = useState(SettingsManager.getInstance().getSettings().showHomePageCamera);
  const [handColor, setHandColor] = useState(SettingsManager.getInstance().getSettings().handColor);

  useEffect(() => {
    const unsub = SettingsManager.getInstance().subscribe((settings) => {
      setShowCamera(settings.showHomePageCamera);
      setHandColor(settings.handColor);
    });
    return unsub;
  }, []);

  console.log("Current user in ActionHomePage", user);

  return (
    <div className="row g-0 min-vh-100">
      {/* LEFT – DASHBOARD + MASCOT */}
      <LeftPanel user={user} />

      {/* RIGHT – camera / landmarks */}
      <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center border-start border-1 border-secondary py-3">
        {showCamera ? (
          <>
            <div className="shadow-sm text-info fw-light mb-2" role="alert">
              Try out the hand recognition here!
            </div>
            <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100" style={{ maxHeight: '90vh' }}>
              <div className="d-flex align-items-center justify-content-center w-100 h-100">
                <HandLandmarks mode={view} color={handColor} />
              </div>
            </div>
          </>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center text-secondary opacity-50">
            <CameraOff size={64} className="mb-3" />
            <p className="fs-5">Camera disabled in Settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
