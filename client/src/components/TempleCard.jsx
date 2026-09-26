import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { resolveImageUrl, DEFAULT_TEMPLE_IMAGE } from "../utils/imageUrl";

const TempleCard = ({ temple }) => {
  // const imgSrc = resolveImageUrl(temple.image);
  const imgSrc = resolveImageUrl(temple.image || temple.imageUrl);
  return (
    <div className="card temple-card">
      <div className="temple-card-media">
        <img src={imgSrc} alt={temple.templeName} onError={(e) => (e.target.src = DEFAULT_TEMPLE_IMAGE)} />
      </div>
      <div className="temple-card-body">
        <h3>{temple.templeName}</h3>
        <div className="temple-meta temple-meta-location">
          <MapPin size={15} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {temple.location}
          </span>
        </div>
        <div className="temple-meta">
          <Clock size={14} />
          {temple.darshanStartTime} – {temple.darshanEndTime}
        </div>
        <p className="temple-desc">{temple.description}</p>
        <Link to={`/temples/${temple._id}`} style={{ marginTop: "auto" }}>
          <button className="btn btn-primary btn-sm temple-card-btn">
            View Temple <ArrowRight size={15} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TempleCard;
