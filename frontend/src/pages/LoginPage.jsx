import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { handleLogin, loginFirebase, loginLocal } from "../api/auth";
import { Globe, MessageCircle, CodeXml, Mail } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const location = useLocation();

    // Affiche l'erreur passée par la redirection (ex: ProtectedRoute)
  React.useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Email or Username</span>
          </label>
          <input
            type="text"
            name="email"
            placeholder="Enter your email or username"
            className="input input-bordered w-full"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="············"
            className="input input-bordered w-full"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              name="rememberMe"
              className="checkbox checkbox-primary checkbox-sm"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span className="label-text">Remember me</span>
          </label>
          <Link to="/forgot-password" className="link link-primary text-sm">
            Forgot password?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : null}
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer link */}
        <div className="text-center text-sm mt-2">
          <span className="text-slate-500">New on our platform? </span>
          <Link to="/register" className="link link-primary font-medium">
            Create an account
          </Link>
        </div>

        {/* Divider */}
        <div className="divider text-sm text-slate-400">or</div>

        {/* Social login */}
        <div className="flex items-center justify-center gap-3">
          <button type="button" className="btn btn-square btn-outline btn-sm" disabled>
            <Globe className="w-4 h-4" />
          </button>
          <button type="button" className="btn btn-square btn-outline btn-sm" disabled>
            <MessageCircle className="w-4 h-4" />
          </button>
          <button type="button" className="btn btn-square btn-outline btn-sm" disabled>
            <CodeXml className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="btn btn-square btn-outline btn-sm"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
