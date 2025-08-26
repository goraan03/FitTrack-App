import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ObrišiVrednostPoKljuču } from "../../helpers/local_storage";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { AppRole } from "../../routes/roleRoutes";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
  redirectTo?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    ObrišiVrednostPoKljuču("authToken");
    logout();
  };

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user?.uloga || !allowed.includes(user.uloga as AppRole)) {
      return (
        <main className="min-h-screen bg-gradient-to-tr from-slate-600/75 to-red-800/70 flex items-center justify-center">
          <div className="bg-white/30 backdrop-blur-lg shadow-lg border border-red-300 rounded-2xl p-10 w-full max-w-lg text-center">
            <h2 className="text-3xl font-bold text-red-800/70 mb-4">Немате дозволу</h2>
            <p className="text-gray-800 text-lg mb-6">
              Потребна је улога <span className="font-semibold">"{allowed.join('" ili "')}"</span> за приступ овој страници.
            </p>
            <button
              onClick={handleLogout}
              className="bg-red-700/60 hover:bg-red-700/70 text-white px-6 py-2 rounded-xl transition"
            >
              Одјава из апликације
            </button>
          </div>
        </main>
      );
    }
  }

  return <>{children}</>;
};