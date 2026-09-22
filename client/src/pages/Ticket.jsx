import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookingById } from "../services/bookingService";
import Spinner from "../components/Spinner";
import ErrorState from "../components/ErrorState";
import { formatDate } from "../utils/formatDate";
import { Landmark, QrCode, Printer, ListChecks } from "lucide-react";

const Ticket = () => {
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
      setError("We couldn't load this ticket. It may not exist, or you may not have access to it.");
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

  const qrValue = `DarshanEase|${booking.bookingId}|${booking.temple?.templeName}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="container page">
      <span className="section-eyebrow">Your E-Ticket</span>
      <h2 className="section-title">Darshan Ticket</h2>

      <div className="ticket-card">
        <div className="ticket-header">
          <span className="ticket-brand">
            <Landmark size={18} /> DarshanEase
          </span>
          <span className={`badge badge-${booking.bookingStatus}`}>{booking.bookingStatus}</span>
        </div>
        <div className="ticket-body">
          <div>
            <div className="ticket-qr">
              <img
                src={qrImgUrl}
                alt="Booking QR code"
                style={{ width: "100%", height: "100%" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <p className="ticket-qr-hint">
              <QrCode size={12} style={{ verticalAlign: "-2px" }} /> Show this QR code at the temple entrance
            </p>
          </div>
          <dl className="ticket-details">
            <dt>Booking ID</dt>
            <dd>{booking.bookingId}</dd>
            <dt>Temple</dt>
            <dd>{booking.temple?.templeName}</dd>
            <dt>Darshan</dt>
            <dd>{booking.slot?.darshanName}</dd>
            <dt>Date</dt>
            <dd>{formatDate(booking.slot?.date)}</dd>
            <dt>Timing</dt>
            <dd>{booking.slot?.startTime} - {booking.slot?.endTime}</dd>
            <dt>Devotees</dt>
            <dd>{booking.numberOfDevotees}</dd>
            <dt>Darshan Type</dt>
            <dd style={{ textTransform: "capitalize" }}>{booking.darshanType}</dd>
            <dt>Total Amount</dt>
            <dd>₹{booking.totalAmount}</dd>
          </dl>
        </div>
        <div className="ticket-divider" />
        <div className="ticket-footer">
          Please carry a valid photo ID along with this ticket for entry.
        </div>
      </div>

      <div className="ticket-actions">
        <button className="btn btn-outline" onClick={() => window.print()}>
          <Printer size={16} /> Print Ticket
        </button>
        <Link to="/my-bookings">
          <button className="btn btn-primary">
            <ListChecks size={16} /> My Bookings
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Ticket;
