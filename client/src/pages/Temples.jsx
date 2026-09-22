import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTemples } from "../services/templeService";
import TempleCard from "../components/TempleCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/SkeletonCard";
import { Search, Landmark } from "lucide-react";

const Temples = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [temples, setTemples] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTemples = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getTemples(query);
      setTemples(res.data.temples);
    } catch (err) {
      setError("Unable to load temples. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = searchParams.get("q") || "";
    loadTemples(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(search ? { q: search } : {});
    loadTemples(search);
  };

  return (
    <div className="container page">
      <span className="section-eyebrow">Discover</span>
      <h2 className="section-title">Temples</h2>
      <p className="section-subtitle">Search and browse temples to book your darshan</p>

      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by temple name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadTemples(search)} />
      ) : temples.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No temples found"
          description={search ? `Nothing matched "${search}". Try a different search.` : "No temples are available yet."}
        />
      ) : (
        <div className="grid grid-3">
          {temples.map((t) => (
            <TempleCard key={t._id} temple={t} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Temples;
