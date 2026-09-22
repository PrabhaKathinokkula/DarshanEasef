import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSlotById } from "../services/slotService";
import { createBooking } from "../services/bookingService";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import { formatDate } from "../utils/formatDate";
import { Landmark, Clock, Users, Minus, Plus, AlertCircle } from "lucide-react";

const Booking = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [numberOfDevotees, setNumberOfDevotees] = useState(1);
  const [darshanType, setDarshanType] = useState("normal");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getSlotById(slotId);
      setSlot(res.data.slot);
    } catch (err) {
      setLoadError("This darshan slot could not be found. It may have been removed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId]);

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  const unitPrice = darshanType === "vip" ? slot.vipPrice || slot.price : slot.price;
  const totalAmount = unitPrice * numberOfDevotees;
  const maxSeats = slot.availableSeats;

  const adjustDevotees = (delta) => {
    setNumberOfDevotees((n) => Math.min(maxSeats, Math.max(1, n + delta)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!Number.isInteger(numberOfDevotees) || numberOfDevotees < 1) {
      setError("Please enter a valid number of devotees.");
      return;
    }
    if (numberOfDevotees > maxSeats) {
      setError(`Only ${maxSeats} seat(s) are available for this slot.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({ slotId, numberOfDevotees, darshanType });
      navigate(`/booking-confirmation/${res.data.booking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <span className="section-eyebrow">Review & Confirm</span>
      <h2 className="section-title">Book Darshan</h2>

      <div className="card card-pad" style={{ maxWidth: 540, margin: "0 auto" }}>
        <h3 style={{ marginTop: 0, marginBottom: "0.3rem", color: "var(--teal-800)" }}>{slot.darshanName}</h3>
        <p className="temple-meta"><Landmark size={14} /> {slot.temple?.templeName}</p>
        <p className="temple-meta"><Clock size={14} /> {formatDate(slot.date)} · {slot.startTime} – {slot.endTime}</p>
        <p className="temple-meta"><Users size={14} /> {slot.availableSeats} seat(s) available</p>

        {error && (
          <div className="alert alert-error" style={{ marginTop: "1rem" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: "1.4rem" }}>
            <label>Darshan Type</label>
            <div className="darshan-type-toggle">
              <button
                type="button"
                className={darshanType === "normal" ? "active" : ""}
                onClick={() => setDarshanType("normal")}
              >
                Normal · ₹{slot.price}
              </button>
              <button
                type="button"
                className={darshanType === "vip" ? "active" : ""}
                disabled={!slot.vipPrice}
                onClick={() => slot.vipPrice && setDarshanType("vip")}
              >
                VIP {slot.vipPrice > 0 ? `· ₹${slot.vipPrice}` : "· N/A"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Number of Devotees</label>
            <div className="devotee-stepper">
              <button type="button" onClick={() => adjustDevotees(-1)} disabled={numberOfDevotees <= 1}>
                <Minus size={16} />
              </button>
              <span>{numberOfDevotees}</span>
              <button type="button" onClick={() => adjustDevotees(1)} disabled={numberOfDevotees >= maxSeats}>
                <Plus size={16} />
              </button>
              <span className="field-hint" style={{ marginLeft: "0.5rem" }}>max {maxSeats}</span>
            </div>
          </div>

          <div style={{ marginTop: "1.2rem" }}>
            <div className="summary-row">
              <span>Price per devotee</span>
              <span>₹{unitPrice}</span>
            </div>
            <div className="summary-row">
              <span>Number of devotees</span>
              <span>× {numberOfDevotees}</span>
            </div>
            <div className="summary-total">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: "1.4rem" }} disabled={submitting || maxSeats === 0}>
            {submitting ? "Confirming Booking..." : "Confirm Booking"}
          </button>
          <p className="muted-link" style={{ textAlign: "center" }}>
            Changed your mind? <Link to={`/temples/${slot.temple?._id}`}>Back to temple</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Booking;
