import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Landmark, AlertCircle, Check } from "lucide-react";

const REGISTER_IMG = "/images/temples/auth-temple.jpg";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const validateField = (field, value) => {
  switch (field) {
    case "email":
      return EMAIL_REGEX.test(value) ? "" : "Please enter a valid email address.";
    case "phone":
      return PHONE_REGEX.test(value) ? "" : "Please enter a valid 10-digit mobile number.";
    case "password":
      return PASSWORD_REGEX.test(value)
        ? ""
        : "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    default:
      return "";
  }
};

const passwordChecks = (value) => [
  { label: "8+ characters", met: value.length >= 8 },
  { label: "Uppercase letter", met: /[A-Z]/.test(value) },
  { label: "Lowercase letter", met: /[a-z]/.test(value) },
  { label: "Number", met: /\d/.test(value) },
  { label: "Special character", met: /[^A-Za-z0-9]/.test(value) },
];

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [fieldErrors, setFieldErrors] = useState({ email: "", phone: "", password: "" });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (["email", "phone", "password"].includes(name)) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = {
      email: validateField("email", form.email),
      phone: validateField("phone", form.phone),
      password: validateField("password", form.password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, phone: true, password: true });
    if (errors.email || errors.phone || errors.password) return;

    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === "organizer") navigate("/organizer/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checks = passwordChecks(form.password);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-image" style={{ backgroundImage: `url(${REGISTER_IMG})` }}>
          <div className="auth-image-caption">
            <strong>Begin your journey.</strong>
            <span>Create an account to book darshans and keep your tickets in one place.</span>
          </div>
        </div>
        <div className="auth-form">
          <div className="auth-brand">
            <Landmark size={20} />
            Darshan<span>Ease</span>
          </div>
          <h2>Create your account</h2>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Full name</label>
              <div className="input-wrap">
                <User size={16} className="field-icon" />
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email address</label>
              <div className="input-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.email && touched.email ? "input-error" : ""}
                  required
                />
              </div>
              {fieldErrors.email && touched.email && <div className="field-error">{fieldErrors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <div className="input-wrap">
                  <Phone size={16} className="field-icon" />
                  <input
                    type="text"
                    name="phone"
                    inputMode="numeric"
                    maxLength="10"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fieldErrors.phone && touched.phone ? "input-error" : ""}
                    required
                  />
                </div>
                {fieldErrors.phone && touched.phone && <div className="field-error">{fieldErrors.phone}</div>}
              </div>

              <div className="form-group">
                <label>Register as</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="user">Devotee</option>
                  <option value="organizer">Temple Organizer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <div className="input-wrap">
                <MapPin size={16} className="field-icon" />
                <input type="text" name="address" value={form.address} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap has-toggle">
                <Lock size={16} className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.password && touched.password ? "input-error" : ""}
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
              <ul className="password-checklist">
                {checks.map((c) => (
                  <li key={c.label} className={c.met ? "met" : ""}>
                    <Check size={12} /> {c.label}
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="muted-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
