import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-custom-color-dark border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">
            <img src="logo.png" alt="Logo" style={{ height: '60px' }} />
        </Link>

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

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/login"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                Login
              </NavLink>
            </li>

            {/* Optional dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                More
              </a>
              <ul className="dropdown-menu bg-dark" aria-labelledby="navDropdown">
                <li><NavLink className="dropdown-item text-white" to="/about">About</NavLink></li>
                
                <li><hr className="dropdown-divider bg-light" /></li>
                <li><a className="dropdown-item  text-white" href="https://github.com/SandalCodez/CSC490_Capstone" target="_blank" rel="noreferrer">GitHub</a></li>
              </ul>
            </li>
          </ul>

          <div className="d-flex gap-2">
            <NavLink to="/login" className="btn btn-outline-light rounded-pill">Sign in</NavLink>
            <NavLink to="/login" className="btn btn-outline-primary rounded-pill">Get Started</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
