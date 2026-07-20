import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Wraps any route that requires authentication.
// If there's no token, redirects to /login automatically.
export default function ProtectedRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace/>;
}