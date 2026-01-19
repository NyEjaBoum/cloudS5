import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", formData);
    // Appel API ici
  };

  return (
    <AuthLayout
      title="Welcome to Mapeo"
      subtitle="Please sign in to your account and start the adventure"
      leftSide={true}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Email or Username</label>
          <input
            type="text"
            name="email"
            placeholder="Enter your email or username"
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
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="link">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn-primary">
          Login
        </button>

        <div className="auth-footer">
          <span>New on our platform? </span>
          <Link to="/register" className="link">
            Create an account
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