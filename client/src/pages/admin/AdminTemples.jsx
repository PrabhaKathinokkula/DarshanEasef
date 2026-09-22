import { useEffect, useState } from "react";
import { getTemples, createTemple, updateTemple, deleteTemple } from "../../services/templeService";
import { getUsers } from "../../services/adminService";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ConfirmModal from "../../components/ConfirmModal";
import { Landmark } from "lucide-react";


const emptyForm = {
  templeName: "",
  location: "",
  description: "",
  darshanStartTime: "",
  darshanEndTime: "",
  organizer: ""
};
// const emptyForm = { templeName: "", location: "", description: "", darshanStartTime: "", darshanEndTime: "" };

const AdminTemples = () => {
  const [temples, setTemples] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [actionError, setActionError] = useState("");

  // const load = async () => {
  //   setLoading(true);
  //   setLoadError("");
  //   try {
  //     const res = await getTemples();
  //     setTemples(res.data.temples);
  //   } catch (err) {
  //     setLoadError("Unable to load temples. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getTemples();
      setTemples(res.data.temples || []);

      const organizerRes = await getUsers("organizer");
      setOrganizers(organizerRes.data.users || []);
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.message || "Unable to load temples. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const startEdit = (temple) => {
    setForm({
      templeName: temple.templeName,
      location: temple.location,
      description: temple.description,
      darshanStartTime: temple.darshanStartTime,
      darshanEndTime: temple.darshanEndTime,
      organizer: temple.organizer?._id || "",
    });
    setEditingId(temple._id);
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (imageFile) formData.append("image", imageFile);

      if (editingId) {
        const response = await updateTemple(editingId, formData);
        setTemples((currentTemples) => currentTemples.map((temple) => (
          temple._id === editingId ? response.data.temple : temple
        )));
      } else {
        await createTemple(formData);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save temple.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = confirming;
    setConfirming(null);
    setActionError("");
    try {
      await deleteTemple(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete temple.");
    }
  };

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  return (
    <div className="container page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>Temples</h2>
        <button className="btn btn-primary btn-sm" onClick={startCreate}>Add Temple</button>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {showForm && (
        <div className="card card-pad" style={{ maxWidth: 500, margin: "0 auto 2rem" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Update Temple" : "Add Temple"}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Temple Name</label>
              <input type="text" name="templeName" value={form.templeName} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Open</label>
                <input type="text" name="darshanStartTime" value={form.darshanStartTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Close</label>
                <input type="text" name="darshanEndTime" value={form.darshanEndTime} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>
            <label>Organizer</label>

<select
  name="organizer"
  value={form.organizer}
  onChange={handleChange}
  required
>
  <option value="">Select Organizer</option>

  {organizers.map((organizer) => (
    <option key={organizer._id} value={organizer._id}>
      {organizer.name} - {organizer.email}
    </option>
  ))}
</select>
            <div className="form-group">
              <label>Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
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

      {temples.length === 0 ? (
        <EmptyState icon={Landmark} title="No temples yet" description="Add your first temple to get started." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Temple</th>
                <th>Location</th>
                <th>Organizer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {temples.map((t) => (
                <tr key={t._id}>
                  <td>{t.templeName}</td>
                  <td>{t.location}</td>
                  <td>{t.organizer?.name || "-"}</td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(t)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirming(t._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!confirming}
        title="Delete this temple?"
        description="This also removes its darshan slots. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirming(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminTemples;
