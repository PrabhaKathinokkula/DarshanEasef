import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSlotById, updateSlot } from "../../services/slotService";
import Spinner from "../../components/Spinner";

const toDateInput = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().split("T")[0];
};

const UpdateDarshan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    darshanName: "",
    date: "",
    startTime: "",
    endTime: "",
    totalSeats: "",
    price: "",
    vipPrice: "",
    description: "",
    status: "open",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSlotById(id);
        const s = res.data.slot;
        setForm({
          darshanName: s.darshanName,
          date: toDateInput(s.date),
          startTime: s.startTime,
          endTime: s.endTime,
          totalSeats: s.totalSeats,
          price: s.price,
          vipPrice: s.vipPrice,
          description: s.description,
          status: s.status,
        });
      } catch (err) {
        setError("Darshan not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateSlot(id, form);
      navigate("/organizer/darshans");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update darshan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container page">
      <h2 className="section-title">Update Darshan</h2>
      <div className="card card-pad" style={{ maxWidth: 500, margin: "0 auto" }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
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
              <input type="text" name="startTime" value={form.startTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Close</label>
              <input type="text" name="endTime" value={form.endTime} onChange={handleChange} required />
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
              <input type="number" name="vipPrice" min="0" value={form.vipPrice} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateDarshan;
