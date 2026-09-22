import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import BrandLogo from "./BrandLogo";

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <BrandLogo size={42} light />
              <span className="footer-brand-text">
                <span className="footer-brand-name">
                  Darshan<span>Ease</span>
                </span>
                <span className="footer-brand-tagline">Devotion Made Simple</span>
              </span>
            </div>
            <p className="footer-about">
              Your trusted platform for a simpler temple darshan experience — search temples,
              choose a slot, and book with confidence.
            </p>
          </div>

          <div>
            <h5>Explore</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/temples">Temples</Link></li>
              <li><Link to="/#about">About</Link></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h5>Account</h5>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DarshanEase. All rights reserved.</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <MapPin size={14} /> Made for pilgrims across India
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
