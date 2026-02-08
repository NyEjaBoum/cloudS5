import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { handleLogin } from "../api/auth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "admin@gmail.com",
    password: "admin123",
    rememberMe: false
  });

  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <AuthLayout
      title="Bienvenue"
      subtitle="Connectez-vous pour acceder a votre espace"
      leftSide={true}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              name="email"
              placeholder="votre@email.com"
              className="input-clean pl-10"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Entrez votre mot de passe"
              className="input-clean pl-10 pr-10"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span className="text-sm text-slate-500">Se souvenir de moi</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
            Mot de passe oublie ?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary-warm w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </AuthLayout>
  );
}
