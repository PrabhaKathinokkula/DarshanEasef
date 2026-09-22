import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTemple, updateTemple, createTemple } from "../../services/templeService";
import Spinner from "../../components/Spinner";

const UpdateTemple = () => {
  const navigate = useNavigate();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    templeName: "",
    location: "",
    description: "",
    darshanStartTime: "",
    darshanEndTime: "",
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyTemple();
        setTemple(res.data.temple);
        setForm({
          templeName: res.data.temple.templeName,
          location: res.data.temple.location,
          description: res.data.temple.description,
          darshanStartTime: res.data.temple.darshanStartTime,
          darshanEndTime: res.data.temple.darshanEndTime,
        });
      } catch (err) {
        // no temple yet - allow creation
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
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (imageFile) formData.append("image", imageFile);

      if (temple) {
        await updateTemple(temple._id, formData);
      } else {
        await createTemple(formData);
      }
      navigate("/organizer/temple");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save temple.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container page">
      <h2 className="section-title">{temple ? "Update Temple" : "Create Temple"}</h2>
      <div className="card card-pad" style={{ maxWidth: 500, margin: "0 auto" }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Temple Name</label>
            <input type="text" name="templeName" value={form.templeName} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Open</label>
              <input type="text" name="darshanStartTime" value={form.darshanStartTime} onChange={handleChange} placeholder="06:00 AM" required />
            </div>
            <div className="form-group">
              <label>Close</label>
              <input type="text" name="darshanEndTime" value={form.darshanEndTime} onChange={handleChange} placeholder="09:00 PM" required />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Update Temple Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? "Saving..." : temple ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateTemple;
