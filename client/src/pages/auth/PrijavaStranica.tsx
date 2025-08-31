import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PrijavaForma } from "../../components/autentifikacija/PrijavaForma";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { getDashboardPathForRole } from "../../routes/roleRoutes";

interface LoginPageProps {
  authApi: IAuthAPIService;
}

export default function PrijavaStranica({ authApi }: LoginPageProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user?.uloga) {
      const path = getDashboardPathForRole(user.uloga);
      if (path) navigate(path, { replace: true });
      // ako je null -> ostaje na login stranici (nema više redirect na /dashboard)
    }
  }, [isLoading, isAuthenticated, user?.uloga, navigate]);

  return (
    <main className="min-h-screen relative overflow-hidden flex items-start sm:items-center justify-center bg-gradient-to-b from-sky-50 via-white to-indigo-50 px-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="w-full max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 text-white shadow-xl ring-1 ring-indigo-300/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 12h4l2-6 4 12 2-6h6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Prijavite se na nalog</h1>
          <p className="mt-2 text-gray-600">
            Ili{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              kreirajte novi nalog
            </Link>
          </p>
        </div>

        <PrijavaForma authApi={authApi} />
      </div>
    </main>
  );
}