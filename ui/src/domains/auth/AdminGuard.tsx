import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { identity, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>; // Replace with a skeleton if needed
    }

    if (!identity) {
        // Optionally redirect to a public page if not logged in
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    if (!identity.isAdmin) {
        // Wait: current Identity.isAdmin is a placeholder. 
        // In logic step 9b, we assume for now if logged in, we check if they are an admin.
        // If not, we redirect to dashboard.
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
