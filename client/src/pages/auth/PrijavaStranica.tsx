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
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="px-4 sm:px-6 pt-16 pb-24">
        <div className="max-w-md mx-auto">
          {/* Brand */}
          <div className="mb-10 flex justify-center opacity-0 animate-fade-in-up">
            <Brand size="lg" />
          </div>

          {/* Card */}
          <div
            className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]
                      overflow-hidden opacity-0 animate-fade-in-up stagger-1"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  FitTrack
                </div>
                <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide text-white">
                  Sign In
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                  Access your account and continue training
                </p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-black/30 border border-white/5 rounded-xl p-1 text-xs font-bold uppercase tracking-widest mb-6">
                <Link
                  to="/login"
                  className="text-center py-2.5 rounded-lg bg-white/10 text-white border border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  Sign Up
                </Link>
              </div>

              {/* Form */}
              <PrijavaForma authApi={authApi} />
            </div>
          </div>

          {/* Footer */}
          <div
            className="mt-6 text-center text-sm text-slate-500 opacity-0 animate-fade-in-up stagger-2"
            style={{ animationFillMode: "forwards" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-white hover:text-slate-200 font-semibold underline underline-offset-4"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}