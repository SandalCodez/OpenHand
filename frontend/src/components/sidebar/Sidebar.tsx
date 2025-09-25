// src/components/sidebar/Sidebar.tsx
import { NavLink } from "react-router-dom";
import React from "react";
import { FaUser, FaCog, FaBook, FaHome } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: "block",
    padding: "12px 16px",
    borderRadius: "8px",
    color: isActive ? "#fff" : "#cbd5e1",
    background: isActive ? "#494949ff" : "transparent",
    textDecoration: "none",
    fontWeight: 500,
    transition: "all 0.2s ease",
  });

  return (
    <aside
      style={{
        width: "220px",
        background: "#0b0b12",
        color: "#fff",
        minHeight: "100vh",
        padding: "1rem",
        boxSizing: "border-box",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#f9fafb", marginBottom: "1.5rem" }}>Dashboard</h2>
      <nav>
        <NavLink to="/dashboard/profile" style={linkStyle}>
          <FaUser style={{ marginRight: "8px" }} /> Profile
        </NavLink>
        <NavLink to="/dashboard/actionHome" style={linkStyle}>
          <FaHome style={{ marginRight: "8px" }} /> Home
        </NavLink>
        <NavLink to="/dashboard/settings" style={linkStyle}>
          <FaCog style={{ marginRight: "8px" }} /> Settings
        </NavLink>
        <NavLink to="/dashboard/classes" style={linkStyle}>
          <FaBook style={{ marginRight: "8px" }} /> Classes
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
