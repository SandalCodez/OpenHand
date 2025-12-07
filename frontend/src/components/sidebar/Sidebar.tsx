import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Cog, User2, LogOut, Route } from "lucide-react";
import "./Sidebar.css";

type NavItem = {
  to: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const items: NavItem[] = [
  { to: "/dashboard/actionHome", label: "Home", Icon: Home },
  { to: "/dashboard/profile", label: "Profile", Icon: User2 },
  { to: "/dashboard/allclasses", label: "Classes", Icon: BookOpen },
  { to: "/dashboard/roadmap", label: "Road Map", Icon: Route },
  { to: "/dashboard/settings", label: "Settings", Icon: Cog },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sidenav d-flex flex-column">
      {/* Profile icon (uses the same link style for consistent spacing) */}
      <div className="sidenav__profile d-flex flex-column align-items-center border-bottom border-opacity-10 ">
        <NavLink
          to="/dashboard/actionHome"
          className="sidenav__link d-flex align-items-center  justify-content-center"
          aria-label="Profile"
        >
          <img src="../../logo.png" alt="logo" className="sidenav__icon-user2" />
          <span className="sidenav__tooltip">OPEN HAND</span>
        </NavLink>
      </div>

      {/* Centered nav icons */}
      <nav className="sidenav__nav d-flex flex-column align-items-center justify-content-center flex-grow-1">
        <ul className="list-unstyled m-0 p-0 w-100 d-flex flex-column align-items-center gap-2">
          {items.map(({ to, label, Icon }) => (
            <li key={to} className="w-100 d-flex justify-content-center">
              <NavLink
                to={to}
                aria-label={label}
                className={({ isActive }) =>
                  `sidenav__link d-flex align-items-center  justify-content-center ${isActive ? "sidenav__link--active rounded-pill " : ""
                  }`
                }
              >
                <Icon className="sidenav__icon" aria-hidden="true" />
                <span className="sidenav__tooltip">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Optional bottom action (e.g., logout) */}
      <div className="sidenav__bottom border-top border-opacity-10 d-flex justify-content-center py-2">
        <NavLink
          to="/logout"
          aria-label="Log out"
          className="sidenav__link d-flex  align-items-center justify-content-center"
        >
          <LogOut className="sidenav__icon" aria-hidden="true" />
          <span className="sidenav__tooltip">Log out</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
