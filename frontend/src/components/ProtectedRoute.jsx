import React from "react";
import { Navigate } from "react-router-dom";

// Fonction utilitaire pour décoder le JWT (simple, sans vérif signature)
function parseJwt(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("jwt");
  const user = parseJwt(token);

  // Pas connecté
  if (!token || !user) return <Navigate to="/login" replace />;

  // Si un rôle est requis, on vérifie
  if (requiredRole && String(user.role) !== String(requiredRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}