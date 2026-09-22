import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUsers, updateUser, deleteUser } from "../../services/adminService";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ConfirmModal from "../../components/ConfirmModal";
import { Users as UsersIcon } from "lucide-react";

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "" });

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getUsers("user");
      setUsers(res.data.users);
    } catch (err) {
      setLoadError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionError("");

    try {
      await updateUser(editingId, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update user.");
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
      setActionError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleToggleStatus = async (user) => {
    if (currentUser?._id === user._id) {
      setActionError("You cannot disable your own admin account.");
      return;
    }

    try {
      await updateUser(user._id, { isActive: !user.isActive });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update account status.");
    }
  };

  if (loading) return <Spinner />;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={load} /></div>;

  return (
    <div className="container page">
      <h2 className="section-title">Users</h2>
      {actionError && <div className="alert alert-error">{actionError}</div>}

      {users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Devotees who register will appear here." />
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
              {users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td style={{ fontSize: "0.75rem" }}>{u._id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.isActive ? "badge-open" : "badge-closed"}`}>{u.isActive ? "Active" : "Disabled"}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(u)}>Edit</button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(u)}>{u.isActive ? "Disable" : "Enable"}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirming(u._id)}>Delete</button>
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
          <h3 className="section-title" style={{ marginBottom: "1rem" }}>Update user</h3>
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
        title="Delete this user?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirming(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminUsers;
