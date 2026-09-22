import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/adminService";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";
import Spinner from "../../components/Spinner";
import ErrorState from "../../components/ErrorState";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getAdminDashboard();
      setStats(res.data);
    } catch (err) {
      setLoadError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner />;
  if (loadError || !stats) {
    return <div className="container page"><ErrorState message={loadError || "Unable to load dashboard."} onRetry={load} /></div>;
  }

  return (
    <div className="container page">
      <h2 className="section-title">Dashboard</h2>
      <div className="grid grid-4">
        <StatCard label="Users" value={stats.totalUsers} color="purple" />
        <StatCard label="Organizers" value={stats.totalOrganizers} color="teal" />
        <StatCard label="Temples" value={stats.totalTemples} color="orange" />
        <StatCard label="Darshans" value={stats.totalDarshans} color="gold" />
      </div>
      <div className="grid grid-4" style={{ marginTop: "1.5rem" }}>
        <StatCard label="Total Bookings" value={stats.totalBookings} color="green" />
      </div>

      <div className="chart-card">
        <h4 style={{ marginTop: 0 }}>Overview</h4>
        <BarChart
          data={[
            { label: "Users", value: stats.totalUsers },
            { label: "Organizers", value: stats.totalOrganizers },
            { label: "Temples", value: stats.totalTemples },
            { label: "Darshans", value: stats.totalDarshans },
            { label: "Bookings", value: stats.totalBookings },
          ]}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
