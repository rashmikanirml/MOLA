import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { auth } = useContext(AuthContext);

  // Not logged in
  if (!auth.token) {
    return <Navigate to="/" />;
  }

  // Admin route check
  if (adminOnly && auth.role !== "ROLE_ADMIN") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;