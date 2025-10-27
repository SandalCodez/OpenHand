// App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
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

export default function App() {
  const location = useLocation();

  // hide navbar on dashboard pages
  const hideNavbar = location.pathname.startsWith("/dashboard");

  return (
    <div>
      {!hideNavbar && (
        <div className="container p-0 p-3 ">
          <nav>
          <Navbar />
        </nav>
        </div>
        
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path= "/logout" element={<LogoutPage/>}/>

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
