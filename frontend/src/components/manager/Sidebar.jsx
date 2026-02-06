import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserPlus, ShieldOff, Clock, MapPin, Map } from "lucide-react";
import logo from "../../assets/mapeo.png";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `sidebar-link ${
      isActive
        ? "bg-teal-100 text-teal-800 font-semibold"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    }`;

  return (
    <aside className="w-[260px] bg-white border-r border-slate-100 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
          <img src={logo} alt="Mapeo" className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-slate-800 tracking-tight">
          Mapeo
        </span>
      </div>

      <div className="h-px bg-slate-100 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* GENERAL */}
        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-300">
            General
          </p>
          <NavLink to="/manager" end className={linkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
        </div>

        {/* UTILISATEURS */}
        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-300">
            Utilisateurs
          </p>
          <div className="space-y-0.5">
            <NavLink to="/manager/users" className={linkClass}>
              <Users size={18} />
              Liste des utilisateurs
            </NavLink>
            <NavLink to="/manager/register-user" className={linkClass}>
              <UserPlus size={18} />
              Creer un utilisateur
            </NavLink>
            <NavLink to="/manager/blocked-users" className={linkClass}>
              <ShieldOff size={18} />
              Utilisateurs bloques
            </NavLink>
            <NavLink to="/manager/historique-blocages" className={linkClass}>
              <Clock size={18} />
              Historique blocages
            </NavLink>
          </div>
        </div>

        {/* SIGNALEMENTS */}
        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-300">
            Signalements
          </p>
          <div className="space-y-0.5">
            <NavLink to="/manager/signalements" className={linkClass}>
              <MapPin size={18} />
              Liste des signalements
            </NavLink>
            <NavLink to="/carte" className={linkClass}>
              <Map size={18} />
              Carte visiteur
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-500">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">Mapeo Admin</p>
            <p className="text-[11px] text-slate-400 truncate">Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
