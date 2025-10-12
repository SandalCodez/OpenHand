// src/app/pages/dashboard/ActionPage.tsx
import { Outlet } from "react-router-dom";
import React, {useEffect, useState}from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Squares from "../../../components/squares/Squares";

const ActionPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(()=>{
    const userData = localStorage.getItem('currentUser');
    if(userData){
      setCurrentUser(JSON.parse(userData));
    }
  },[]);
  return (
    <div className="d-flex min-vh-100 w-100">
      {/* Left rail */}
      <Sidebar /> 
      <Squares
            speed={0.2}
            squareSize={25}
            direction="right"
            borderColor="#2a2a2aff"
            hoverFillColor="#00a6ffff"
          />
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
