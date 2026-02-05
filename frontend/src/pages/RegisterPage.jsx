import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";

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

    if (!formData.termsAccepted) {
      setError("Vous devez accepter les conditions d'utilisation.");
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
      if (!res.ok) throw new Error(data || "Erreur lors de l'inscription");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Creer un compte"
      subtitle="Rejoignez Mapeo et commencez a gerer vos signalements"
      leftSide={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom / Prenom */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                name="lastname"
                placeholder="Votre nom"
                className="input-clean pl-10"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Prenom</label>
            <input
              type="text"
              name="firstname"
              placeholder="Votre prenom"
              className="input-clean"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="email"
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 caracteres"
              className="input-clean pl-10"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="termsAccepted"
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            checked={formData.termsAccepted}
            onChange={handleChange}
            required
          />
          <span className="text-sm text-slate-500">
            J'accepte les{" "}
            <Link to="/privacy" className="font-medium text-teal-600 hover:text-teal-700">
              conditions d'utilisation
            </Link>
          </span>
        </label>

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
          {loading ? "Inscription..." : "Creer mon compte"}
        </button>

        {/* Footer link */}
        <div className="text-center text-sm">
          <span className="text-slate-400">Deja un compte ? </span>
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700 transition-colors">
            Se connecter
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
