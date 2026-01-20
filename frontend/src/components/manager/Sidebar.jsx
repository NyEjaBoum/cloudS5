import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar-manager">
      <div className="sidebar-title">Mapeo</div>
      
      <div className="sidebar-block">
        <div className="sidebar-block-title">HOME</div>
        <NavLink to="/manager" className="sidebar-link">
          <i className="fas fa-home"></i>
          Dashboard
        </NavLink>
      </div>

      <div className="sidebar-block">
        <div className="sidebar-block-title">UTILISATEURS</div>
        <NavLink to="/manager/users" className="sidebar-link">
          <i className="fas fa-users"></i>
          Liste des utilisateurs
        </NavLink>
      </div>

      <div className="sidebar-block">
        <div className="sidebar-block-title">SIGNALEMENTS</div>
        <NavLink to="/manager/signalements" className="sidebar-link">
          <i className="fas fa-map-marker-alt"></i>
          Liste des signalements
        </NavLink>
      </div>
    </aside>
  );
}