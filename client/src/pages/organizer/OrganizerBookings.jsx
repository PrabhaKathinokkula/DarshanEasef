import { useEffect, useState } from "react";
import { getBookings } from "../../services/bookingService";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { Ticket } from "lucide-react";

const OrganizerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      setLoadError("Unable to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  return (
    <div className="container page">
      <h2 className="section-title">Bookings</h2>
      {bookings.length === 0 ? (
        <EmptyState icon={Ticket} title="No bookings yet" description="Bookings for your temple will appear here." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Devotee</th>
                <th>Email</th>
                <th>Darshan</th>
                <th>Devotees</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookingId}</td>
                  <td>{b.user?.name}</td>
                  <td>{b.user?.email}</td>
                  <td>{b.slot?.darshanName}</td>
                  <td>{b.numberOfDevotees}</td>
                  <td>₹{b.totalAmount}</td>
                  <td><span className={`badge badge-${b.bookingStatus}`}>{b.bookingStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrganizerBookings;
