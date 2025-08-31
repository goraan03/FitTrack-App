import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuthHook";

// Stare/nepostojeće rute (/dashboard, /coach) usmeravamo bezbedno
export default function LegacyRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user?.uloga === 'admin') {
    return <Navigate to="/admin/users" replace />;
  }
  return <Navigate to="/login" replace />;
}