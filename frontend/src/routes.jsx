import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RecapPage from "./pages/RecapPage.jsx";
import CartePage from "./pages/CartePage.jsx";
import DashboardManager from "./pages/manager/Dashboard.jsx";
import UsersManager from "./pages/manager/Users.jsx";
import SignalementsManager from "./pages/manager/Signalements.jsx";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recap" element={<RecapPage />} />
      <Route path="/carte" element={<CartePage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/manager" element={<DashboardManager />}>
        <Route path="users" element={<UsersManager />} />
        <Route path="signalements" element={<SignalementsManager />} />
    </Route>
    </Routes>
  </Router>
);

export default AppRoutes;