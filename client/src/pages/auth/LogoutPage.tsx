import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { ObrišiVrednostPoKljuču } from "../../helpers/localStorage/local_storage";

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      ObrišiVrednostPoKljuču("authToken");
      ObrišiVrednostPoKljuču("authBootId");
      ObrišiVrednostPoKljuču("user");
      ObrišiVrednostPoKljuču("twofa_state");
    } catch {}
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-indigo-50">
      <div className="text-center text-gray-700">
        <svg className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Logging out...
      </div>
    </main>
  );
}