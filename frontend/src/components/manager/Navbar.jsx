import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";
import { Search, Bell, Settings, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le menu si on clique en dehors
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
    <nav className="navbar bg-base-100 shadow-sm border-b border-silver px-6">
      <div className="flex-1">
        {/* Left side - intentionally empty as in original */}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            type="text"
            className="input input-bordered input-sm w-64 pl-9"
            placeholder="Rechercher..."
          />
        </div>

        {/* Icon buttons */}
        <button className="btn btn-ghost btn-circle btn-sm">
          <Bell size={18} />
        </button>
        <button className="btn btn-ghost btn-circle btn-sm">
          <Settings size={18} />
        </button>

        {/* User dropdown */}
        <div className="dropdown dropdown-end" ref={dropdownRef}>
          <div
            tabIndex={0}
            role="button"
            className="avatar placeholder cursor-pointer"
            onClick={() => setOpen((o) => !o)}
          >
            <div className="bg-primary text-white rounded-full w-9">
              <span className="text-sm font-semibold">M</span>
            </div>
          </div>

          {open && (
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box shadow-lg w-52 p-2 mt-2 border border-silver z-50"
            >
              <li>
                <a className="flex items-center gap-2">
                  <User size={16} />
                  My Profile
                </a>
              </li>
              <li>
                <a className="flex items-center gap-2">
                  <Settings size={16} />
                  My Account
                </a>
              </li>
              <li>
                <button
                  className="flex items-center gap-2 text-error"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
