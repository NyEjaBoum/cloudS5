import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth"; // <-- Mets l'import ici, tout en haut

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
    <nav className="navbar-manager">
      <div className="navbar-left">
        {/* <h1 className="navbar-title">Dashboard</h1> */}
      </div>
      <div className="navbar-right">
        <input
          type="text"
          className="search-box"
          placeholder="Rechercher..."
        />
        <div className="navbar-icons">
          <button className="nav-icon">
            <i className="fas fa-bell"></i>
          </button>
          <button className="nav-icon">
            <i className="fas fa-cog"></i>
          </button>
          <div
            className="user-icon"
            onClick={() => setOpen((o) => !o)}
            style={{ position: "relative", cursor: "pointer" }}
            ref={dropdownRef}
          >
            <i className="fas fa-user"></i>
            {open && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <i className="fas fa-user"></i> My Profile
                </div>
                <div className="dropdown-item">
                  <i className="fas fa-envelope"></i> My Account
                </div>
                <div className="dropdown-item">
                  <i className="fas fa-tasks"></i> My Tasks
                </div>
                <button className="dropdown-logout" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}