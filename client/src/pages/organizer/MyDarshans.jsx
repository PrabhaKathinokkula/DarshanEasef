import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMySlots, deleteSlot } from "../../services/slotService";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ConfirmModal from "../../components/ConfirmModal";
import { CalendarClock } from "lucide-react";

const MyDarshans = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirming, setConfirming] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getMySlots();
      setSlots(res.data.slots);
    } catch (err) {
      setLoadError("Unable to load your darshans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    const id = confirming;
    setConfirming(null);
    setActionError("");
    try {
      await deleteSlot(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete darshan.");
    }
  };

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  return (
    <div className="container page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>My Darshans</h2>
        <Link to="/organizer/darshan/create">
          <button className="btn btn-primary btn-sm">Create Darshan</button>
        </Link>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {slots.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No darshans created yet" description="Create your first darshan slot for devotees to book.">
          <Link to="/organizer/darshan/create">
            <button className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem" }}>Create Darshan</button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-3">
          {slots.map((slot) => (
            <div className="card card-pad" key={slot._id}>
              <h4 style={{ marginTop: 0, color: "var(--teal-800)" }}>Darshan Name: {slot.darshanName}</h4>
              <p className="temple-meta">Open: {slot.startTime}</p>
              <p className="temple-meta">Close: {slot.endTime}</p>
              <p className="temple-meta">Normal Darshan: ₹{slot.price}</p>
              <p className="temple-meta">VIP Darshan: {slot.vipPrice > 0 ? `₹${slot.vipPrice}` : "N/A"}</p>
              <p className="temple-desc">Description: {slot.description}</p>
              <span className={`badge badge-${slot.status}`}>{slot.status}</span>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/organizer/darshan/${slot._id}/edit`)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirming(slot._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirming}
        title="Delete this darshan slot?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirming(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default MyDarshans;
