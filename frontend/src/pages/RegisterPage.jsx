import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    termsAccepted: false
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation simple
    if (!formData.termsAccepted) {
      setError("You must accept the terms.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          motDePasse: formData.password,
          nom: formData.lastname,
          prenom: formData.firstname
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data || "Registration failed");
      // Redirige vers login ou dashboard après succès
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Adventure starts here"
      subtitle="Make your app management easy and fun!"
      leftSide={false}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastname"
            placeholder="Enter your last name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstname"
            placeholder="Enter your firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="············"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
            />
            I agree to{" "}
            <Link to="/privacy" className="link">
              privacy policy & terms
            </Link>
          </label>
        </div>
        {error && <div className="error" style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login" className="link">
            Sign in instead
          </Link>
        </div>

        <div className="divider">or</div>

        <div className="social-login">
          <button type="button" className="social-btn facebook">
            <i className="fab fa-facebook-f"></i>
          </button>
          <button type="button" className="social-btn twitter">
            <i className="fab fa-twitter"></i>
          </button>
          <button type="button" className="social-btn github">
            <i className="fab fa-github"></i>
          </button>
          <button type="button" className="social-btn google">
            <i className="fab fa-google"></i>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}