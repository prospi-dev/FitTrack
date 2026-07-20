import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Wraps any route that requires authentication.
// If there's no token, redirects to /login automatically.
// Pass `role` to also require the logged-in user to have that role
// (e.g. role="Admin") — mismatches redirect to /dashboard.
export default function ProtectedRoute({ children, role }) {
    const { token, user } = useAuth();
    if (!token) return <Navigate to="/login" replace/>;
    if (role && user?.role !== role) return <Navigate to="/dashboard" replace/>;
    return children;
}