import { useEffect, useState } from "react";
import { getTemples } from "../../services/templeService";
import { createSlot, deleteSlot, getSlots, updateSlot } from "../../services/slotService";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ConfirmModal from "../../components/ConfirmModal";
import { CalendarClock } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

const initialForm = {
  darshanName: "",
  temple: "",
  date: "",
  startTime: "",
  endTime: "",
  totalSeats: "",
  price: "",
  vipPrice: "",
  description: "",
  status: "open",
};

const toDateInput = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const AdminDarshans = () => {
  const [slots, setSlots] = useState([]);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [slotRes, templeRes] = await Promise.all([getSlots("", true), getTemples()]);
      setSlots(slotRes.data.slots || []);
      setTemples(templeRes.data.temples || []);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Unable to load darshans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  };

  const startEdit = (slot) => {
    setEditingId(slot._id);
    setForm({
      darshanName: slot.darshanName || "",
      temple: slot.temple?._id || slot.temple || "",
      date: toDateInput(slot.date),
      startTime: slot.startTime || "",
      endTime: slot.endTime || "",
      totalSeats: slot.totalSeats ?? "",
      price: slot.price ?? "",
      vipPrice: slot.vipPrice ?? "",
      description: slot.description || "",
      status: slot.status || "open",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (editingId) {
        const { temple, ...updates } = form;
        await updateSlot(editingId, updates);
      } else {
        await createSlot({ ...form, totalSeats: Number(form.totalSeats), price: Number(form.price), vipPrice: Number(form.vipPrice || 0) });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save darshan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = confirming;
    setConfirming(null);
    setActionError("");
    try {
      await deleteSlot(id);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete darshan.");
    }
  };

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  return (
    <div className="container page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>Darshans</h2>
        <button className="btn btn-primary btn-sm" onClick={startCreate}>Create Darshan</button>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {showForm && (
        <div className="card card-pad" style={{ maxWidth: 500, margin: "0 auto 2rem" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Update Darshan" : "Create Darshan"}</h3>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            {!editingId && (
              <div className="form-group">
                <label>Temple</label>
                <select name="temple" value={form.temple} onChange={handleChange} required>
                  <option value="">Select Temple</option>
                  {temples.map((temple) => (
                    <option key={temple._id} value={temple._id}>{temple.templeName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Darshan Name</label>
              <input type="text" name="darshanName" value={form.darshanName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Open</label>
                <input type="text" name="startTime" value={form.startTime} onChange={handleChange} placeholder="09:00 AM" required />
              </div>
              <div className="form-group">
                <label>Close</label>
                <input type="text" name="endTime" value={form.endTime} onChange={handleChange} placeholder="04:00 PM" required />
              </div>
            </div>

            <div className="form-group">
              <label>Total Seats</label>
              <input type="number" name="totalSeats" min="1" value={form.totalSeats} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Normal Price</label>
                <input type="number" name="price" min="0" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>VIP Price</label>
                <input type="number" name="vipPrice" min="0" value={form.vipPrice} onChange={handleChange} placeholder="0" />
              </div>
            </div>

            {editingId && (
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="full">Full</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {slots.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No darshans found" description="Create a darshan slot for a temple to get started." />
      ) : (
        <div className="grid grid-3">
          {slots.map((slot) => (
            <div className="card card-pad" key={slot._id}>
              <h4 style={{ marginTop: 0, color: "var(--teal-800)" }}>{slot.darshanName}</h4>
              <p className="temple-meta">Temple: {slot.temple?.templeName || "-"}</p>
              <p className="temple-meta">Date: {formatDate(slot.date)}</p>
              <p className="temple-meta">Open: {slot.startTime}</p>
              <p className="temple-meta">Close: {slot.endTime}</p>
              <p className="temple-meta">Seats: {slot.availableSeats}/{slot.totalSeats}</p>
              <p className="temple-meta">Normal Darshan: ₹{slot.price}</p>
              <p className="temple-meta">VIP Darshan: {slot.vipPrice > 0 ? `₹${slot.vipPrice}` : "N/A"}</p>
              <p className="temple-desc">Description: {slot.description}</p>
              <span className={`badge badge-${slot.status}`}>{slot.status}</span>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
                <button className="btn btn-outline btn-sm" onClick={() => startEdit(slot)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirming(slot._id)}>Delete</button>
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

export default AdminDarshans;
