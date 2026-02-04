import React from "react";
import { Navigate, useLocation } from "react-router-dom";

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
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ error: "Veuillez vous connecter." }} />;
  }

  if (requiredRole && String(user.role) !== String(requiredRole)) {
    return <Navigate to="/login" replace state={{ error: "Vous n'avez pas le droit d'accéder à cette page." }} />;
  }

  return children;
}