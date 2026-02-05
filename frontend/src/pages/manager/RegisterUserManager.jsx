import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerLocal } from "../../api/auth";
import { AlertCircle, UserPlus, User, Mail, Lock } from "lucide-react";

export default function RegisterUserManager() {
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("jwt");
      await registerLocal({
        email: formData.email,
        password: formData.password,
        lastname: formData.lastname,
        firstname: formData.firstname
      }, token);
      navigate("/manager/users");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="w-full max-w-lg mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Creer un utilisateur</h1>
        <p className="text-sm text-slate-400 mt-0.5">Ajouter un nouvel utilisateur au systeme</p>
      </div>

      <div className="w-full max-w-lg">
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom / Prenom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                  <User size={13} className="text-slate-400" />
                  Nom
                </label>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Nom de famille"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="input-clean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Prenom</label>
                <input
                  type="text"
                  name="firstname"
                  placeholder="Prenom"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="input-clean"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Mail size={13} className="text-slate-400" />
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="adresse@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-clean"
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Lock size={13} className="text-slate-400" />
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-clean"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary-warm w-full flex items-center justify-center gap-2 text-sm"
              disabled={loading}
            >
              <UserPlus size={15} />
              {loading ? "Creation..." : "Creer l'utilisateur"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
