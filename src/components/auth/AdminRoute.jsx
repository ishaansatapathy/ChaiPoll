import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Renders children only if the authenticated user has the "admin" role.
 * Redirects non-admins to /dashboard with a clear indication.
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // ProtectedRoute already shows a spinner

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
