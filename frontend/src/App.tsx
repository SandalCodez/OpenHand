// App.tsx (or App.jsx if you prefer)
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import HomePage from "./app/pages/Home/HomePage";
import SignInPage from "./app/pages/Login/SignInPage";
import Navbar from "./components/navbar/Navbar";
import AboutPage from "./app/pages/About/AboutPage";
import ActionPage from "./app/pages/dashboard/ActionPage";
import ProfilePage from "./app/pages/dashboard/ProfilePage";
import SettingsPage from "./app/pages/dashboard/SettingsPage";
import ClassesPage from "./app/pages/dashboard/ClassesPage";
import ActionHomePage from "./app/pages/dashboard/ActionHomePage";
import LogoutPage from "./app/pages/Logout/LogoutPage";
import RoadmapPage from "./app/pages/dashboard/RoadmapPage";
import SplashScreen from "./app/pages/Home/SplashScreen";
import CustomCursor from "./components/CustomCursor";

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/dashboard");

  // Remove sessionStorage if you want it every navigation.
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem("splashDone"));

  useEffect(() => {
    if (!showSplash) sessionStorage.setItem("splashDone", "1");
  }, [showSplash]);

  return (
    <div id="app-root">
        <CustomCursor
        color="#ff2b2b"     // red
        size={14}           // base diameter
        hoverScale={2}    // bigger on hover
        downScale={0.85}    // smaller on click
        // interactiveSelectors='a,button,[role="button"],[data-cursor="interactive"]'
      />
      {/* Overlay splash ABOVE everything */}
      {showSplash && (
        <SplashScreen
          text="OpenHand"
          durationMs={2200}
          fadeMs={700}
          onDone={() => setShowSplash(null)}
        />
      )}

      {/* Your app renders underneath immediately, so it’s visible when splash fades out */}
      {!hideNavbar && (
        <div className="container p-0 p-3">
          <nav><Navbar /></nav>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/dashboard/*" element={<ActionPage />}>
          <Route index element={<ActionHomePage />} />
          <Route path="actionHome" element={<ActionHomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
        </Route>
      </Routes>
    </div>
  );
}
