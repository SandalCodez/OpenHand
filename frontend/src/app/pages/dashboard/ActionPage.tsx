// src/app/pages/dashboard/ActionPage.tsx
import { Outlet } from "react-router-dom";
import React from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Squares from "../../../components/squares/Squares";

const ActionPage: React.FC = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main>
        <Squares 
        speed={0.2} 
        squareSize={25}
        direction='right' // up, down, left, right, diagonal
        borderColor='#2a2a2aff'
        hoverFillColor='#00a6ffff'
        />
        {/* Use session mananger to bring user to these pages. Use the UID to refer to the user and display information 
        This uid will also be used to make any updates to the dashboard as a user progresses through lessons*/}
        <Outlet />
      </main>
    </div>
  );
};

export default ActionPage;
