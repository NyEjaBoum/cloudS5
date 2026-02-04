import React, { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Globe, MessageCircle, CodeXml, Mail } from "lucide-react";

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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Last Name */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Last Name</span>
          </label>
          <input
            type="text"
            name="lastname"
            placeholder="Enter your last name"
            className="input input-bordered w-full"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>

        {/* First Name */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">First Name</span>
          </label>
          <input
            type="text"
            name="firstname"
            placeholder="Enter your firstname"
            className="input input-bordered w-full"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
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

        {/* Terms */}
        <div className="flex items-start">
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              name="termsAccepted"
              className="checkbox checkbox-primary checkbox-sm"
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
            />
            <span className="label-text">
              I agree to{" "}
              <Link to="/privacy" className="link link-primary">
                privacy policy & terms
              </Link>
            </span>
          </label>
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Footer link */}
        <div className="text-center text-sm mt-2">
          <span className="text-slate-500">Already have an account? </span>
          <Link to="/login" className="link link-primary font-medium">
            Sign in instead
          </Link>
        </div>

        {/* Divider */}
        <div className="divider text-sm text-slate-400">or</div>

        {/* Social login */}
        <div className="flex items-center justify-center gap-3">
          <button type="button" className="btn btn-square btn-outline btn-sm">
            <Globe className="w-4 h-4" />
          </button>
          <button type="button" className="btn btn-square btn-outline btn-sm">
            <MessageCircle className="w-4 h-4" />
          </button>
          <button type="button" className="btn btn-square btn-outline btn-sm">
            <CodeXml className="w-4 h-4" />
          </button>
          <button type="button" className="btn btn-square btn-outline btn-sm">
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
