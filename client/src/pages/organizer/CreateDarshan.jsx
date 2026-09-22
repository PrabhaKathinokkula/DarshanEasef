import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTemple } from "../../services/templeService";
import { createSlot } from "../../services/slotService";
import Spinner from "../../components/Spinner";

const CreateDarshan = () => {
  const navigate = useNavigate();
  const [temple, setTemple] = useState(null);
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
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyTemple();
        setTemple(res.data.temple);
      } catch (err) {
        setError("You need a temple set up before creating darshans.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!temple) return;
    setSaving(true);
    try {
      await createSlot({ ...form, temple: temple._id });
      navigate("/organizer/darshans");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create darshan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container page">
      <h2 className="section-title">Create Darshan</h2>
      <div className="card card-pad" style={{ maxWidth: 500, margin: "0 auto" }}>
        {error && <div className="alert alert-error">{error}</div>}
        {temple && (
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

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateDarshan;
