import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getTemples } from "../services/templeService";
import TempleCard from "../components/TempleCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/SkeletonCard";
import {
  Search,
  Landmark,
  CalendarCheck,
  Ticket,
  Zap,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  User,
} from "lucide-react";

// Optimised copies of the existing project images (originals are untouched).
const HERO_IMG = "/images/temples/hero-sunset-temple.jpg";
const CTA_IMG = "/images/temples/cta-temple.jpg";

const Home = () => {
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTemples();
      setTemples(res.data.temples.slice(0, 3));
    } catch (err) {
      setError("Unable to load featured temples right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // UI only: scroll to in-page sections such as "/#about"
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/temples?q=${encodeURIComponent(search.trim())}` : "/temples");
  };

  return (
    <div className="home">
      {/* ---------- Hero ---------- */}
      <section className="hero" style={{ backgroundImage: `url(${HERO_IMG})` }}>
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">Temple Darshan Ticket Booking</span>
            <h1>
              Plan Your
              <br />
              <span className="gold">Sacred Journey</span>
            </h1>
            <p>
              Discover temples across India and book your darshan with ease. A simpler way to stay
              connected with your faith.
            </p>

            <form className="hero-search" onSubmit={handleHeroSearch}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search temples by name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            <div className="hero-actions">
              <Link to="/temples">
                <button className="btn btn-gold">
                  Explore Temples <ArrowRight size={16} />
                </button>
              </Link>
              <Link to="/register">
                <button className="btn btn-outline-white">
                  <User size={16} /> Create an Account
                </button>
              </Link>
            </div>
          </div>
          <div className="hero-quote" aria-hidden="true">
            “Faith makes
            <br />
            all things possible”
          </div>
        </div>
      </section>

      {/* ---------- Popular temples ---------- */}
      <section className="home-section home-popular">
        <div className="container">
          <span className="section-eyebrow">Popular Temples</span>
          <h2 className="section-title">Discover Sacred Destinations</h2>
          <p className="section-subtitle">
            Explore some of the most visited temples and plan your darshan
          </p>

          {loading ? (
            <SkeletonGrid count={3} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : temples.length === 0 ? (
            <EmptyState
              icon={Landmark}
              title="No temples available yet"
              description="Check back soon — organizers are adding temples regularly."
            />
          ) : (
            <div className="grid grid-3">
              {temples.map((t) => (
                <TempleCard key={t._id} temple={t} />
              ))}
            </div>
          )}

          <div className="home-viewall">
            <Link to="/temples">
              <button className="btn btn-outline">
                View All Temples <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="home-section home-steps">
        <div className="container">
          <span className="section-eyebrow">How DarshanEase Works</span>
          <h2 className="section-title">Simple Steps to Book Your Darshan</h2>

          <div className="steps">
            <div className="step">
              <div className="step-circle">
                <Landmark size={34} />
                <span className="step-badge">1</span>
              </div>
              <h3>Choose a Temple</h3>
              <p>Browse temples and view darshan timings, slots, and pricing.</p>
            </div>
            <div className="step-arrow" aria-hidden="true">›</div>
            <div className="step">
              <div className="step-circle">
                <CalendarCheck size={34} />
                <span className="step-badge">2</span>
              </div>
              <h3>Select a Slot</h3>
              <p>Pick your preferred date, darshan type, and number of devotees.</p>
            </div>
            <div className="step-arrow" aria-hidden="true">›</div>
            <div className="step">
              <div className="step-circle">
                <Ticket size={34} />
                <span className="step-badge">3</span>
              </div>
              <h3>Get Your Ticket</h3>
              <p>Receive an instant e-ticket with a QR code for entry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Why DarshanEase (About anchor) ---------- */}
      <section className="home-section home-why" id="about">
        <div className="container">
          <span className="section-eyebrow">Why Choose DarshanEase</span>
          <h2 className="section-title">A Better Darshan Experience</h2>
          <div className="grid grid-4 why-grid">
            <div className="why-card">
              <div className="why-icon"><CalendarCheck size={26} /></div>
              <div>
                <h3>Real Availability</h3>
                <p>Live slot updates</p>
              </div>
            </div>
            <div className="why-card">
              <div className="why-icon"><Zap size={26} /></div>
              <div>
                <h3>Instant E-Tickets</h3>
                <p>Hassle-free booking</p>
              </div>
            </div>
            <div className="why-card">
              <div className="why-icon"><ShieldCheck size={26} /></div>
              <div>
                <h3>Secure Accounts</h3>
                <p>Your data is safe</p>
              </div>
            </div>
            <div className="why-card">
              <div className="why-icon"><Smartphone size={26} /></div>
              <div>
                <h3>Works Everywhere</h3>
                <p>Book on any device</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <section className="home-cta">
        <div className="container">
          <div className="cta-banner" style={{ backgroundImage: `url(${CTA_IMG})` }}>
            <div className="cta-content">
              <h2>Ready to plan your next darshan?</h2>
              <p>Browse temples and reserve your slot in minutes.</p>
              <Link to="/temples">
                <button className="btn btn-gold">
                  Explore Temples <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
