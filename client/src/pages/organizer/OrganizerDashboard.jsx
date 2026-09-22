import { useEffect, useState } from "react";
import { getOrganizerDashboard } from "../../services/adminService";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";
import Spinner from "../../components/Spinner";
import ErrorState from "../../components/ErrorState";

const OrganizerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getOrganizerDashboard();
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
      <div className="grid grid-3">
        <StatCard label="Temples" value={stats.temples} color="teal" />
        <StatCard label="Darshans" value={stats.darshans} color="gold" />
        <StatCard label="Total Bookings" value={stats.totalBookings} color="green" />
      </div>

      <div className="chart-card">
        <h4 style={{ marginTop: 0 }}>Overview</h4>
        <BarChart
          data={[
            { label: "temples", value: stats.temples },
            { label: "darshans", value: stats.darshans },
            { label: "bookings", value: stats.totalBookings },
          ]}
        />
      </div>
    </div>
  );
};

export default OrganizerDashboard;
