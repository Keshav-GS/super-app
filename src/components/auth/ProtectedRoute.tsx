import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
    requiredRole?: UserRole;
    children: React.ReactNode;
}

export default function ProtectedRoute({
    requiredRole = "employee",
    children
}: ProtectedRouteProps) {
    const { currentUser, hasAccess } = useAuth();
    const location = useLocation();

    // Still loading authentication state
    if (currentUser === undefined) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // Not logged in
    if (currentUser === null) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (!hasAccess(requiredRole)) {
        return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }

    // User authenticated and authorized
    return <>{children}</>;
}
