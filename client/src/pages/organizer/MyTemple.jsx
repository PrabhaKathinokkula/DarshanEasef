import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTemple } from "../../services/templeService";
import Spinner from "../../components/Spinner";
import { resolveImageUrl, DEFAULT_TEMPLE_IMAGE } from "../../utils/imageUrl";

const MyTemple = () => {
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyTemple();
        setTemple(res.data.temple);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  if (notFound) {
    return (
      <div className="container page empty-state">
        <p>You don't have a temple assigned yet.</p>
        <p style={{ fontSize: "0.85rem" }}>Please contact the admin to have a temple assigned to your account.</p>
      </div>
    );
  }

  const imgSrc = resolveImageUrl(temple.image);

  return (
    <div className="container page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>My Temple</h2>
        <Link to="/organizer/temple/update">
          <button className="btn btn-primary btn-sm">Edit Temple</button>
        </Link>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: "0 auto", overflow: "hidden" }}>
        <img src={imgSrc} alt={temple.templeName} style={{ width: "100%", height: 220, objectFit: "cover" }}
          onError={(e) => (e.target.src = DEFAULT_TEMPLE_IMAGE)} />
        <div className="card-pad">
          <h3 style={{ marginTop: 0, color: "var(--teal-800)" }}>{temple.templeName}</h3>
          <p className="temple-meta">Open: {temple.darshanStartTime} &nbsp;|&nbsp; Close: {temple.darshanEndTime}</p>
          <p className="temple-meta">📍 {temple.location}</p>
          <p>{temple.description}</p>
        </div>
      </div>
    </div>
  );
};

export default MyTemple;
