import React from "react";
import SidebarManager from "../../components/manager/Sidebar.jsx";
import NavbarManager from "../../components/manager/Navbar.jsx";
import { Outlet } from "react-router-dom";
import "../../styles/manager.css";

export default function Dashboard() {
  return (
    <div className="manager-layout">
      <SidebarManager />
      <div className="manager-main">
        <NavbarManager />
        <div className="manager-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}