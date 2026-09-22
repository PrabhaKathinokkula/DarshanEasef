import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTempleById } from "../services/templeService";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { formatDate, isToday } from "../utils/formatDate";
import { resolveImageUrl, DEFAULT_TEMPLE_IMAGE } from "../utils/imageUrl";
import { Clock, MapPin, Users, MessageSquarePlus, CalendarClock } from "lucide-react";

const TempleDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [temple, setTemple] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTempleById(id);
      setTemple(res.data.temple);
      setSlots(res.data.slots);
    } catch (err) {
      setError("This temple could not be found, or is no longer available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = (slotId) => {
    if (!user) {
      navigate("/login", { state: { from: `/booking/${slotId}` } });
      return;
    }
    if (user.role !== "user") return;
    navigate(`/booking/${slotId}`);
  };

  if (loading) return <Spinner />;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={load} /></div>;

  const imgSrc = resolveImageUrl(temple.image);
  const todaySlots = slots.filter((s) => isToday(s.date));
  const upcomingSlots = slots.filter((s) => !isToday(s.date));

  const renderSlotCard = (slot) => {
    const soldOut = slot.status === "full" || slot.availableSeats === 0;
    const bookable = slot.status === "open" && slot.availableSeats > 0;
    const lowSeats = bookable && slot.availableSeats <= Math.max(5, Math.round(slot.totalSeats * 0.1));

    return (
      <div className="card slot-card" key={slot._id}>
        <div className="slot-card-top">
          <h4>{slot.darshanName}</h4>
          <span className={`badge badge-${soldOut ? "full" : slot.status}`}>
            {soldOut ? "Sold Out" : slot.status}
          </span>
        </div>
        <p className="temple-meta"><Clock size={14} /> {slot.startTime} – {slot.endTime} · {formatDate(slot.date)}</p>
        <p className="temple-meta"><Users size={14} /> {slot.availableSeats} of {slot.totalSeats} seats available</p>
        {lowSeats && <span className="seats-left">Only {slot.availableSeats} seat(s) left</span>}
        {slot.description && <p className="temple-desc">{slot.description}</p>}
        <div className="slot-price">
          ₹{slot.price} <small>normal</small>
          {slot.vipPrice > 0 && (
            <>
              {" "}&nbsp;·&nbsp; ₹{slot.vipPrice} <small>VIP</small>
            </>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm btn-block"
          disabled={!bookable}
          onClick={() => handleBook(slot._id)}
        >
          {bookable ? "Book Now" : soldOut ? "Sold Out" : "Unavailable"}
        </button>
      </div>
    );
  };

  return (
    <div className="container page">
      <div className="card" style={{ overflow: "hidden", marginBottom: "2rem" }}>
        <img
          src={imgSrc}
          alt={temple.templeName}
          style={{ width: "100%", height: 300, objectFit: "cover" }}
          onError={(e) => (e.target.src = DEFAULT_TEMPLE_IMAGE)}
        />
        <div className="card-pad">
          <h2 style={{ color: "var(--teal-800)", marginTop: 0, marginBottom: "0.6rem" }}>{temple.templeName}</h2>
          <p className="temple-meta"><MapPin size={15} /> {temple.location}</p>
          <p className="temple-meta"><Clock size={15} /> Darshan hours: {temple.darshanStartTime} – {temple.darshanEndTime}</p>
          <p className="temple-desc" style={{ WebkitLineClamp: "unset", marginTop: "0.9rem" }}>{temple.description}</p>
          {user && user.role === "user" && (
            <Link to={`/feedback/${temple._id}`}>
              <button className="btn btn-outline btn-sm">
                <MessageSquarePlus size={15} /> Leave Feedback
              </button>
            </Link>
          )}
        </div>
      </div>

      <span className="section-eyebrow">Available Slots</span>
      <h3 className="section-title">Darshans</h3>

      {slots.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming darshan slots"
          description="This temple's organizer hasn't published any upcoming darshan slots yet. Please check back soon."
        />
      ) : (
        <>
          {todaySlots.length > 0 && (
            <>
              <div className="slot-group-label"><CalendarClock size={17} /> Today</div>
              <div className="grid grid-3">{todaySlots.map(renderSlotCard)}</div>
            </>
          )}
          {upcomingSlots.length > 0 && (
            <>
              <div className="slot-group-label"><CalendarClock size={17} /> Upcoming</div>
              <div className="grid grid-3">{upcomingSlots.map(renderSlotCard)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TempleDetails;
