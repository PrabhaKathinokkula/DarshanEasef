import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookingById } from "../services/bookingService";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import { formatDate } from "../utils/formatDate";
import { CheckCircle2, Ticket as TicketIcon, ListChecks } from "lucide-react";

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBookingById(bookingId);
      setBooking(res.data.booking);
    } catch (err) {
      setError("We couldn't load this booking. It may not exist, or you may not have access to it.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (loading) return <Spinner />;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div className="container page">
      <div className="card card-pad" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div className="state-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ color: "var(--success)", marginBottom: "0.3rem" }}>Booking Confirmed!</h2>
        <p className="temple-desc" style={{ marginBottom: "1.4rem" }}>
          Your darshan slot is reserved. Show your e-ticket QR code at the temple entrance.
        </p>

        <div style={{ textAlign: "left" }}>
          <div className="profile-row">
            <span>Booking ID</span>
            <span>{booking.bookingId}</span>
          </div>
          <div className="profile-row">
            <span>Temple</span>
            <span>{booking.temple?.templeName}</span>
          </div>
          <div className="profile-row">
            <span>Darshan</span>
            <span>{booking.slot?.darshanName || "-"}</span>
          </div>
          <div className="profile-row">
            <span>Date</span>
            <span>{formatDate(booking.slot?.date)}</span>
          </div>
          <div className="profile-row">
            <span>Devotees</span>
            <span>{booking.numberOfDevotees}</span>
          </div>
          <div className="profile-row">
            <span>Total Amount</span>
            <span>₹{booking.totalAmount}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", marginTop: "1.6rem", flexWrap: "wrap" }}>
          <Link to={`/ticket/${booking._id}`}>
            <button className="btn btn-primary">
              <TicketIcon size={16} /> View E-Ticket
            </button>
          </Link>
          <Link to="/my-bookings">
            <button className="btn btn-outline">
              <ListChecks size={16} /> My Bookings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
