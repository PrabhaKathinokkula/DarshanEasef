import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile as updateProfileApi } from "../services/authService";

const Profile = () => {
  const { user, updateLocalUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
  });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address };
      if (form.password) payload.password = form.password;
      const res = await updateProfileApi(payload);
      updateLocalUser(res.data.user);
      setMessage("Profile updated successfully.");
      setEditing(false);
      setForm({ ...form, password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container page">
      <h2 className="section-title">My Profile</h2>
      <div className="card card-pad" style={{ maxWidth: 500, margin: "0 auto" }}>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!editing ? (
          <>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || "-"}</p>
            <p><strong>Address:</strong> {user.address || "-"}</p>
            <p><strong>Role:</strong> <span className={`badge badge-${user.role}`}>{user.role}</span></p>
            <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>New Password (optional)</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" />
            </div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
