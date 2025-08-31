import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PrijavaForma } from "../../components/autentifikacija/PrijavaForma";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { getDashboardPathForRole } from "../../routes/roleRoutes";
import Brand from "../../components/common/Brand";

interface LoginPageProps { authApi: IAuthAPIService; }

export default function PrijavaStranica({ authApi }: LoginPageProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user?.uloga) {
      const path = getDashboardPathForRole(user.uloga);
      if (path) navigate(path, { replace: true });
    }
  }, [isLoading, isAuthenticated, user?.uloga, navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50/60 px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="mb-8 flex justify-center">
          <Brand size="lg" />
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight">Welcome</h1>
            <p className="text-gray-600 mt-1">Sign in to your account</p>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1 text-sm font-medium mb-6">
            <Link
              to="/login"
              className="text-center py-2 rounded-lg bg-white shadow-sm text-emerald-700"
            >
              Sign In
            </Link>
            <Link to="/register" className="text-center py-2 rounded-lg text-gray-600 hover:text-gray-800">
              Sign Up
            </Link>
          </div>

          <PrijavaForma authApi={authApi} />
        </div>
      </div>
    </main>
  );
}