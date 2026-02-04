import React from "react";
import SidebarManager from "../../components/manager/Sidebar.jsx";
import NavbarManager from "../../components/manager/Navbar.jsx";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-base-200 overflow-hidden">
      <SidebarManager />
      <div className="flex-1 flex flex-col overflow-hidden">
        <NavbarManager />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
