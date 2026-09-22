import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import ConfirmModal from "../components/ConfirmModal";
import { formatDate } from "../utils/formatDate";
import { Ticket } from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getMyBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      setLoadError("Unable to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async () => {
    const id = confirming;
    setConfirming(null);
    try {
      await cancelBooking(id);
      setMessage("Booking cancelled successfully.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  return (
    <div className="container page">
      <h2 className="section-title">My Bookings</h2>
      {message && <div className="alert alert-success">{message}</div>}

      {bookings.length === 0 ? (
        <EmptyState icon={Ticket} title="You haven't booked a darshan yet" description="Explore temples and reserve your first darshan slot.">
          <Link to="/temples">
            <button className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem" }}>Explore Temples</button>
          </Link>
        </EmptyState>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Temple</th>
                <th>Booking ID</th>
                <th>Darshan</th>
                <th>Date</th>
                <th>Devotees</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.temple?.templeName}</td>
                  <td>{b.bookingId}</td>
                  <td>{b.slot?.darshanName}</td>
                  <td>{formatDate(b.slot?.date)}</td>
                  <td>{b.numberOfDevotees}</td>
                  <td>₹{b.totalAmount}</td>
                  <td>
                    <span className={`badge badge-${b.bookingStatus}`}>{b.bookingStatus}</span>
                  </td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link to={`/ticket/${b._id}`}>
                      <button className="btn btn-outline btn-sm">Ticket</button>
                    </Link>
                    {b.bookingStatus === "confirmed" && (
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirming(b._id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!confirming}
        title="Cancel this booking?"
        description="Your seats will be released back for other devotees. This action cannot be undone."
        confirmLabel="Cancel Booking"
        danger
        onCancel={() => setConfirming(null)}
        onConfirm={handleCancel}
      />
    </div>
  );
};

export default MyBookings;
