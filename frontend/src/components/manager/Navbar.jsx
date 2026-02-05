import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";
import { Search, Bell, Settings, User, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
      {/* Left side */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <div className="relative mr-2">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            type="text"
            className="w-56 pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all"
            placeholder="Rechercher..."
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
          <Settings size={18} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-100 mx-1.5" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-50 transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-elevated border border-slate-100 py-1.5 z-50 animate-fade-in">
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <User size={15} />
                Mon profil
              </button>
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Settings size={15} />
                Parametres
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Deconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
