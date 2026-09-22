const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-media" />
    <div className="skeleton-body">
      <div className="skeleton skeleton-line w-80" />
      <div className="skeleton skeleton-line w-60" />
      <div className="skeleton skeleton-line w-40" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 3, columns = "grid-3" }) => (
  <div className={`grid ${columns}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
