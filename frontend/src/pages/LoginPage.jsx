import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { handleLogin, loginFirebase, loginLocal } from "../api/auth";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

const handleSubmit = (e) => {
  e.preventDefault();
  handleLogin(formData, navigate, setError, setLoading);
};

  // Login Google/Firebase
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const token = await loginFirebase(idToken);
      localStorage.setItem("jwt", token);
      navigate("/manager");
    } catch (err) {
      if (err.message.includes("Aucun compte local associé")) {
        setError("Ce compte Google existe, mais il n'est pas autorisé sur cette application. Contactez un administrateur.");
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
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

        {error && <div className="error" style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-footer">
          <span>New on our platform? </span>
          <Link to="/register" className="link">
            Create an account
          </Link>
        </div>

        <div className="divider">or</div>

        <div className="social-login">
          <button type="button" className="social-btn facebook" disabled>
            <i className="fab fa-facebook-f"></i>
          </button>
          <button type="button" className="social-btn twitter" disabled>
            <i className="fab fa-twitter"></i>
          </button>
          <button type="button" className="social-btn github" disabled>
            <i className="fab fa-github"></i>
          </button>
          <button
            type="button"
            className="social-btn google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <i className="fab fa-google"></i>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}