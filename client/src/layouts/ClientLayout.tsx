import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Brand from "../components/common/Brand";
import { useAuth } from "../hooks/auth/useAuthHook";
import { LayoutDashboard, CalendarDays, ListChecks, UserRound } from "lucide-react";

const linkBase = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition";
const linkActive = "text-yellow-300 ring-1 ring-yellow-400/60 bg-yellow-400/10";
const linkIdle = "text-gray-300 hover:text-yellow-300 hover:bg-yellow-400/5";

export default function ClientLayout() {
  const links = [
    { to: "/app/dashboard", label: "Dashboard" },
    { to: "/app/sessions", label: "Sessions" },
    { to: "/app/programs", label: "Programs" },
    { to: "/app/profile", label: "My Profile" },
  ];

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const doLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <div className="bg-black min-h-screen text-white">
      <header className="sticky top-0 z-40 bg-black border-b border-yellow-400/70">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
          <Brand text="FitTrack • Client" />
          <nav className="hidden sm:flex items-center gap-2">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={({isActive})=> `${linkBase} ${isActive?linkActive:linkIdle}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-300">{user?.korisnickoIme}</span>
            <button onClick={doLogout} className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-black/90 border-t border-yellow-400/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-4">
            <NavLink to="/app/dashboard" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <LayoutDashboard className="h-5 w-5" /><span className="text-[11px]">Home</span>
            </NavLink>
            <NavLink to="/app/sessions" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <CalendarDays className="h-5 w-5" /><span className="text-[11px]">Sessions</span>
            </NavLink>
            <NavLink to="/app/programs" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <ListChecks className="h-5 w-5" /><span className="text-[11px]">Programs</span>
            </NavLink>
            <NavLink to="/app/profile" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <UserRound className="h-5 w-5" /><span className="text-[11px]">Profile</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
}