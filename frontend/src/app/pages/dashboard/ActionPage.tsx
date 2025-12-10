// src/app/pages/dashboard/ActionPage.tsx
import { Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Squares from "../../../components/squares/Squares";
import XPButton from "../../../components/buttons/XPButon/XpButton";


const ActionPage: React.FC = () => {

  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchLatestUser = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/users/me", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        localStorage.setItem('currentUser', JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    // Initial load from local storage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Then refresh from network
    fetchLatestUser();
  }, []);

  // Simple next level formula or default.
  const currentLevel = isNaN(Number(currentUser?.level)) ? 1 : Number(currentUser?.level);

  // Example progression: Level 1 = 1000 XP, Level 2 = 1200 XP? 
  // Let's us a placeholder or just a large number if not defined.
  // Ideally this logic should be shared or coming from backend.
  const nextLevelXp = 1000 * Math.pow(1.2, currentLevel);

  return (
    <div className="d-flex min-vh-100 w-100">
      {/* Left rail */}
      <Sidebar />
      <div className="">
        <XPButton
          xp={currentUser?.xp || 0}
          nextXp={Math.round(nextLevelXp)}
          level={currentLevel}
        />
      </div>
      {/* Main content */}
      <main className="flex-grow-1 position-relative overflow-auto">

        {/* Foreground routed content */}
        <div className="container-fluid px-0 position-relative" style={{ zIndex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default ActionPage;
