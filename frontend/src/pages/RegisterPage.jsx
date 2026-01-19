import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: "",
    termsAccepted: false
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
    console.log("Register:", formData);
    // Appel API ici
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

        <button type="submit" className="btn-primary">
          Sign Up
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