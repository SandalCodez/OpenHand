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
        <Outlet />
      </main>
    </div>
  );
};

export default ActionPage;
