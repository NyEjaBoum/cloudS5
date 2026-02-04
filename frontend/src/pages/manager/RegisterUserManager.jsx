import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerLocal } from "../../api/auth";
import { AlertCircle, UserPlus } from "lucide-react";

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
    <div className="max-w-md mx-auto mt-10 animate-fade-in">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">Creer un utilisateur</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nom</span>
              </label>
              <input
                type="text"
                name="lastname"
                placeholder="Nom"
                value={formData.lastname}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
              />
            </div>

            {/* Prenom */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Prenom</span>
              </label>
              <input
                type="text"
                name="firstname"
                placeholder="Prenom"
                value={formData.firstname}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
              />
            </div>

            {/* Mot de passe */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mot de passe</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="btn btn-primary w-full gap-2" disabled={loading}>
              <UserPlus size={16} />
              {loading ? "Creation..." : "Creer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
