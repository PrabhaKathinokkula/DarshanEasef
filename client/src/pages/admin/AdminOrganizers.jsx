import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUsers, createOrganizer, updateUser, deleteUser } from "../../services/adminService";
import { getTemples } from "../../services/templeService";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ConfirmModal from "../../components/ConfirmModal";
import { Building2 } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  templeId: "",
};

const AdminOrganizers = () => {
  const { user: currentUser } = useAuth();
  const [organizers, setOrganizers] = useState([]);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "", templeId: "" });
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const organizerRes = await getUsers("organizer");
      const templeRes = await getTemples();
      setOrganizers(organizerRes.data.users);
      setTemples(templeRes.data.temples || []);
    } catch (err) {
      setLoadError("Unable to load organizers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (organizer) => {
    setEditingId(organizer._id);
    setEditForm({
      name: organizer.name || "",
      email: organizer.email || "",
      phone: organizer.phone || "",
      address: organizer.address || "",
      templeId: temples.find((temple) => String(temple.organizer?._id || temple.organizer) === String(organizer._id))?._id || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionError("");
    try {
      const organizerData = { ...form };
      if (!organizerData.templeId) delete organizerData.templeId;
      await createOrganizer(organizerData);
      setForm(initialForm);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to create organizer account.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionError("");
    try {
      const organizerData = { ...editForm };
      if (!organizerData.templeId) delete organizerData.templeId;
      await updateUser(editingId, organizerData);
      setEditingId(null);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update organizer.");
    }
  };

  const handleToggleStatus = async (organizer) => {
    if (currentUser?._id === organizer._id) {
      setActionError("You cannot disable your own admin account.");
      return;
    }

    try {
      await updateUser(organizer._id, { isActive: !organizer.isActive });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update account status.");
    }
  };

  const handleDelete = async () => {
    const id = confirming;
    setConfirming(null);
    setActionError("");
    try {
      await deleteUser(id);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete organizer.");
    }
  };

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  return (
    <div className="container page">
      <h2 className="section-title">Organizers</h2>
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      <div className="card card-pad" style={{ marginBottom: "1.5rem" }}>
        <h3 className="section-title" style={{ marginBottom: "1rem" }}>Create Organizer</h3>
        <form onSubmit={handleCreate}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Temple</label>
              <select value={form.templeId} onChange={(e) => setForm({ ...form, templeId: e.target.value })}>
                <option value="">Select Temple</option>
                {temples.map((temple) => (
                  <option key={temple._id} value={temple._id}>{temple.templeName}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary">Create Organizer</button>
          </div>
        </form>
      </div>

      {organizers.length === 0 ? (
        <EmptyState icon={Building2} title="No organizers found" description="Organizer accounts will appear here once created." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Sl No</th>
                <th>User ID</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((o, i) => (
                <tr key={o._id}>
                  <td>{i + 1}</td>
                  <td style={{ fontSize: "0.75rem" }}>{o._id}</td>
                  <td>{o.name}</td>
                  <td>{o.email}</td>
                  <td><span className={`badge badge-${o.role}`}>{o.role}</span></td>
                  <td><span className={`badge ${o.isActive ? "badge-open" : "badge-closed"}`}>{o.isActive ? "Active" : "Disabled"}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(o)}>Edit</button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(o)}>{o.isActive ? "Disable" : "Enable"}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirming(o._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingId && (
        <div className="card card-pad" style={{ marginTop: "1.5rem" }}>
          <h3 className="section-title" style={{ marginBottom: "1rem" }}>Update organizer</h3>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={editForm.email} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={editForm.address} onChange={handleEditChange} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Temple</label>
                <select name="templeId" value={editForm.templeId} onChange={handleEditChange}>
                  <option value="">Select Temple</option>
                  {temples.map((temple) => (
                    <option key={temple._id} value={temple._id}>{temple.templeName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirming}
        title="Delete this organizer?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirming(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminOrganizers;
