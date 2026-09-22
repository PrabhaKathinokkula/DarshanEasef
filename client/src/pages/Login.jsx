import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Landmark, AlertCircle } from "lucide-react";

const LOGIN_IMG = "/images/temples/auth-temple.jpg";

const roleHome = {
  user: "/",
  organizer: "/organizer/dashboard",
  admin: "/admin/dashboard",
};

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      const redirectTo = location.state?.from || roleHome[user.role] || "/";
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-image" style={{ backgroundImage: `url(${LOGIN_IMG})` }}>
          <div className="auth-image-caption">
            <strong>Welcome back, devotee.</strong>
            <span>Sign in to manage your darshan bookings and e-tickets.</span>
          </div>
        </div>
        <div className="auth-form">
          <div className="auth-brand">
            <Landmark size={20} />
            Darshan<span>Ease</span>
          </div>
          <h2>Login to your account</h2>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <div className="input-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap has-toggle">
                <Lock size={16} className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <p className="muted-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          <details className="demo-creds">
            <summary>Demo credentials</summary>
            <div>
              Devotee: user@darshanease.com / User@123<br />
              Organizer: organizer@darshanease.com / Organizer@123<br />
              Admin: admin@darshanease.com / Admin@123
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Login;
