import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Brand from "../components/common/Brand";
import { useAuth } from "../hooks/auth/useAuthHook";

const linkBase = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] font-medium";
const linkActive = "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
const linkIdle = "text-gray-700 hover:text-emerald-700 hover:bg-emerald-50";

export default function TrainerLayout() {
  const links = [
    { to: "/trainer/dashboard", label: "Dashboard" },
    { to: "/trainer/exercises", label: "Exercises" },
    { to: "/trainer/programs", label: "Programs" },
    { to: "/trainer/terms", label: "Terms" },
    { to: "/trainer/clients", label: "Clients" },
    { to: "/trainer/profile", label: "My Profile" },
  ];

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  

  const doLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/40">
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Brand text="FitTrack Trainer"/>
          <nav className="hidden sm:flex items-center gap-2">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={({isActive})=> `${linkBase} ${isActive?linkActive:linkIdle}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-600">{user?.korisnickoIme}</span>
            <button
              onClick={doLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}