// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated =
    sessionStorage.getItem("sk_auth") === "true";

  const role = sessionStorage.getItem("sk_role");

  if (!isAuthenticated || !role) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    const allowedPage =
      role === "sakina" ? "/home" : "/chat";

    return <Navigate to={allowedPage} replace />;
  }

  return children;
}

export default ProtectedRoute;