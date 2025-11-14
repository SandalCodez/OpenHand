import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";
import DynamicButton from "../buttons/dynamicButton/DynamicButton";
import { ArrowDown } from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  ` nav-link${isActive ? " active " : ""} `;

export default function Navbar() {
  const location = useLocation();

  /** When user clicks anything that goes to /login */
  const handleLoginClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      // we are on Home → play mascot exit first
      e.preventDefault();
      window.dispatchEvent(new Event("openhand:goLogin"));
    }
    // if we're already on /login or another page, router can handle it normally
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-custom-color-dark
      rounded rounded-5 sticky-top shadow-sm border border-1 border-light">
      <div className="container-fluid">
        {/* Brand / Logo (left) */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-semibold" to="/">
          <img src="/logo.png" alt="Logo" className="brand-logo" />
          <span className="d-none d-sm-inline ">OpenHand</span>
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="mainNav">
          {/* Centered nav links */}
          <ul className="navbar-nav mx-auto mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className={navLinkClass}>
                <DynamicButton>Home</DynamicButton>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/login"
                className={navLinkClass}
                onClick={handleLoginClick}
              >
                <DynamicButton>Login</DynamicButton>
              </NavLink>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link "
                href="#"
                id="navDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                <DynamicButton>
                  More <ArrowDown size={15} />
                </DynamicButton>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="navDropdown">
                <li>
                  <NavLink to="/about" className="dropdown-item">
                    About
                  </NavLink>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a
                    className="dropdown-item"
                    href="https://github.com/SandalCodez/CSC490_Capstone"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          {/* Right side actions */}
          <div className="d-flex gap-2">
            <NavLink
              to="/login"
              className="btn btn-outline-light rounded-pill"
              onClick={handleLoginClick}
            >
              Sign in
            </NavLink>
            <NavLink
              to="/login"
              className="btn btn-light rounded-pill fw-semibold"
              onClick={handleLoginClick}
            >
              Get Started
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
