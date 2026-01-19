import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar-manager">
      <div className="sidebar-title">Manager</div>
      <div className="sidebar-block">
        <div className="sidebar-block-title">Utilisateurs</div>
        <NavLink to="/manager/users" className="sidebar-link">Liste des utilisateurs</NavLink>
      </div>
      <div className="sidebar-block">
        <div className="sidebar-block-title">Signalements</div>
        <NavLink to="/manager/signalements" className="sidebar-link">Liste des signalements</NavLink>
      </div>
    </aside>
  );
}