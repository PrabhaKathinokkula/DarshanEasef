const COLORS = ["#178f80", "#d99b32", "#27ae60", "#8e44ad", "#e67e22"];

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div className="bar-col" key={d.label}>
          <div className="bar-value">{d.value}</div>
          <div
            className="bar"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: COLORS[i % COLORS.length],
            }}
          />
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
