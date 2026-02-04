import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, UserPlus, MapPin } from "lucide-react";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary/20 text-white"
        : "text-neutral-content/70 hover:bg-white/10 hover:text-neutral-content"
    }`;

  return (
    <aside className="w-64 bg-neutral text-neutral-content flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-6 py-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Mapeo
        </h1>
      </div>

      <div className="h-px bg-white/10 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* HOME */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider opacity-50">
            Home
          </p>
          <NavLink to="/manager" end className={linkClass}>
            <Home size={18} />
            Dashboard
          </NavLink>
        </div>

        {/* UTILISATEURS */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider opacity-50">
            Utilisateurs
          </p>
          <div className="space-y-1">
            <NavLink to="/manager/users" className={linkClass}>
              <Users size={18} />
              Liste des utilisateurs
            </NavLink>
            <NavLink to="/manager/register-user" className={linkClass}>
              <UserPlus size={18} />
              Créer un utilisateur
            </NavLink>
          </div>
        </div>

        {/* SIGNALEMENTS */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider opacity-50">
            Signalements
          </p>
          <NavLink to="/manager/signalements" className={linkClass}>
            <MapPin size={18} />
            Liste des signalements
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
