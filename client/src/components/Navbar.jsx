import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut } from "lucide-react";
import BrandLogo from "./BrandLogo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setOpen(false);

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand" onClick={closeMenu}>
        <BrandLogo size={40} />
        <span className="brand-text">
          <span className="brand-name">
            Darshan<span>Ease</span>
          </span>
          <span className="brand-tagline">Devotion Made Simple</span>
        </span>
      </NavLink>

      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`navbar-links ${open ? "open" : ""}`}>
        <NavLink to="/" end onClick={closeMenu} className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/temples" onClick={closeMenu} className={linkClass}>
          Temples
        </NavLink>
        {/* About / Contact are in-page sections (Home "#about" and the footer "#contact"),
            so no new routes are introduced. */}
        <Link to="/#about" onClick={closeMenu}>
          About
        </Link>
        <a href="#contact" onClick={closeMenu}>
          Contact
        </a>

        {!user && (
          <div className="navbar-auth">
            <NavLink
              to="/login"
              onClick={closeMenu}
              className={({ isActive }) => `nav-btn nav-btn-outline ${isActive ? "active" : ""}`}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              onClick={closeMenu}
              className={({ isActive }) => `nav-btn nav-btn-solid ${isActive ? "active" : ""}`}
            >
              Register
            </NavLink>
          </div>
        )}

        {user && user.role === "user" && (
          <>
            <NavLink to="/my-bookings" onClick={closeMenu} className={linkClass}>
              My Bookings
            </NavLink>
            <NavLink to="/profile" onClick={closeMenu} className={linkClass}>
              Profile
            </NavLink>
          </>
        )}

        {user && user.role === "organizer" && (
          <>
            <NavLink to="/organizer/dashboard" onClick={closeMenu} className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/organizer/temple" onClick={closeMenu} className={linkClass}>
              My Temple
            </NavLink>
            <NavLink to="/organizer/darshans" onClick={closeMenu} className={linkClass}>
              Darshans
            </NavLink>
            <NavLink to="/organizer/bookings" onClick={closeMenu} className={linkClass}>
              Bookings
            </NavLink>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" onClick={closeMenu} className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" onClick={closeMenu} className={linkClass}>
              Users
            </NavLink>
            <NavLink to="/admin/organizers" onClick={closeMenu} className={linkClass}>
              Organizers
            </NavLink>
            <NavLink to="/admin/temples" onClick={closeMenu} className={linkClass}>
              Temples
            </NavLink>
            <NavLink to="/admin/darshans" onClick={closeMenu} className={linkClass}>
              Darshans
            </NavLink>
            <NavLink to="/admin/bookings" onClick={closeMenu} className={linkClass}>
              Bookings
            </NavLink>
          </>
        )}

        {user && (
          <div className="navbar-auth">
            <span className="navbar-user-pill">
              <span className="navbar-avatar">{initial}</span>
              {user.name}
            </span>
            <button className="link-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
