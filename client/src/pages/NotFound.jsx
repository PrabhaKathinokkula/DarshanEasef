import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="container page" style={{ textAlign: "center" }}>
    <h1 style={{ fontSize: "4rem", color: "var(--teal-800)", margin: 0 }}>404</h1>
    <p className="section-subtitle">Page not found.</p>
    <Link to="/">
      <button className="btn btn-primary">Go Home</button>
    </Link>
  </div>
);

export default NotFound;
