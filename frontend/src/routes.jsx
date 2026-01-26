import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RecapPage from "./pages/RecapPage.jsx";
import CartePage from "./pages/visiteur/CartePage.jsx";
import DashboardManager from "./pages/manager/Dashboard.jsx";
import UsersManager from "./pages/manager/Users.jsx";
import SignalementsManager from "./pages/manager/Signalements.jsx";
import SignalementDetails from "./pages/manager/SignalementDetails.jsx";
import RegisterUserManager from "./pages/manager/RegisterUserManager.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recap" element={<RecapPage />} />
      <Route path="/carte" element={<CartePage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/manager" element={
        <ProtectedRoute requiredRole={1 /* ou "MANAGER" selon ton JWT */}>
          <DashboardManager />
        </ProtectedRoute>
      }>
        <Route path="users" element={<UsersManager />} />
        <Route path="register-user" element={<RegisterUserManager />} />
        <Route path="signalements" element={<SignalementsManager />} />
        <Route path="signalements/:id" element={<SignalementDetails />} />
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;