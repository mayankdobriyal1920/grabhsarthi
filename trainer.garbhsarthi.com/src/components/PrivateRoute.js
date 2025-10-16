import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredAuth } from "../services/authService";

/**
 * Simple PrivateRoute wrapper that checks for stored token
 * If not authenticated, redirect to login
 */
export default function PrivateRoute({ children }) {
    const { token } = getStoredAuth();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
}
