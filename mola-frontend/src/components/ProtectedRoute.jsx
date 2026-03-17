import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.role) {
    return <Navigate to="/" />;
  }

  if (requiredRole && auth.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;