
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      navigate("/login", {
        state: { message: "Account created! Please sign in." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandLogo />

        <p className="eyebrow">JOIN CAMPUSBITE</p>
        <h1>Create your account</h1>
        <p className="muted">Start exploring food around your campus.</p>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input
            name="full_name"
            placeholder="Your full name"
            value={form.full_name}
            onChange={updateField}
            required
          />

          <label>Email address</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={updateField}
            required
          />

          <label>Phone number</label>
          <input
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={updateField}
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={updateField}
            minLength={8}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button className="primary-button" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
