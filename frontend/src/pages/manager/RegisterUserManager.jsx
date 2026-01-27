import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerLocal } from "../../api/auth";
import "../../styles/manager.css";

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
    <div className="card" style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Créer un utilisateur</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="lastname"
            placeholder="Nom"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Prénom</label>
          <input
            type="text"
            name="firstname"
            placeholder="Prénom"
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
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="error" style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
}