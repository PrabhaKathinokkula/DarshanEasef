const StatCard = ({ label, value, color = "teal" }) => (
  <div className={`stat-card stat-${color}`}>
    <h4>{label}</h4>
    <div className="stat-value">{value}</div>
  </div>
);

export default StatCard;
