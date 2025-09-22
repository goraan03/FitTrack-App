// client/src/pages/auth/PrijavaStranica.tsx
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PrijavaForma } from "../../components/autentifikacija/PrijavaForma";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { getDashboardPathForRole, isPathAllowedForRole } from "../../routes/roleRoutes";
import Brand from "../../components/common/Brand";

interface LoginPageProps { authApi: IAuthAPIService; }

export default function PrijavaStranica({ authApi }: LoginPageProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname as string | undefined;

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user?.uloga) {
      const fallback = getDashboardPathForRole(user.uloga) || "/";

      const isAuthPage =
        from?.startsWith("/login") ||
        from?.startsWith("/register") ||
        from?.startsWith("/logout");

      const shouldUseFrom =
        !!from && !isAuthPage && isPathAllowedForRole(from, user.uloga);

      navigate(shouldUseFrom ? from! : fallback, { replace: true });
    }
  }, [isLoading, isAuthenticated, user?.uloga, from, navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-neutral-900 px-4 py-10 text-white">
      <div className="max-w-md mx-auto">
        {/* Brand */}
        <div className="mb-8 flex justify-center">
          <Brand size="lg" />
        </div>

        {/* Card */}
        <div className="bg-white/95 text-black backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-wide text-secondary">Welcome</h1>
            <p className="text-gray-600 mt-1">Sign in to your account</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-gray-200 rounded-xl p-1 text-sm font-semibold mb-6">
            <Link
              to="/login"
              className="text-center py-2 rounded-lg bg-yellow-400 text-black shadow-md"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-center py-2 rounded-lg text-gray-600 hover:text-black"
            >
              Sign Up
            </Link>
          </div>

          {/* Login form */}
          <PrijavaForma authApi={authApi} />
        </div>
      </div>
    </main>
  );
}