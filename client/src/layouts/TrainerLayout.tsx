import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Brand from "../components/common/Brand";
import { useAuth } from "../hooks/auth/useAuthHook";
import { LayoutDashboard, Dumbbell, ListChecks, CalendarDays, Users, User } from "lucide-react";

const linkBase = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition";
const linkActive = "text-yellow-300 ring-1 ring-yellow-400/60 bg-yellow-400/10";
const linkIdle = "text-gray-300 hover:text-yellow-300 hover:bg-yellow-400/5";

export default function TrainerLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const doLogout = () => { logout(); navigate("/login", { replace: true }); };

  const nav = [
    { to: "/trainer/dashboard", label: "Dashboard" },
    { to: "/trainer/exercises", label: "Exercises" },
    { to: "/trainer/programs", label: "Programs" },
    { to: "/trainer/terms", label: "Terms" },
    { to: "/trainer/clients", label: "Clients" },
    { to: "/trainer/profile", label: "My Profile" },
  ];

  return (
    <div className="bg-black min-h-screen text-white">
      <header className="sticky top-0 z-40 bg-black border-b border-yellow-400/70">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Brand text="FitTrack • Trainer"/>
          <nav className="hidden sm:flex items-center gap-2">
            {nav.map(l => (
              <NavLink key={l.to} to={l.to} className={({isActive})=> `${linkBase} ${isActive?linkActive:linkIdle}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-300">{user?.korisnickoIme}</span>
            <button
              onClick={doLogout}
              className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* bitan pb-20 da sadržaj ne prelazi preko bottom bara na mobilu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) – sada sa svih 6 stavki */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-black/90 border-t border-yellow-400/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-6">
            <NavLink to="/trainer/dashboard" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <LayoutDashboard className="h-5 w-5" /><span className="text-[11px]">Home</span>
            </NavLink>
            <NavLink to="/trainer/exercises" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <Dumbbell className="h-5 w-5" /><span className="text-[11px]">Exercises</span>
            </NavLink>
            <NavLink to="/trainer/programs" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <ListChecks className="h-5 w-5" /><span className="text-[11px]">Programs</span>
            </NavLink>
            <NavLink to="/trainer/terms" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <CalendarDays className="h-5 w-5" /><span className="text-[11px]">Terms</span>
            </NavLink>
            <NavLink to="/trainer/clients" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <Users className="h-5 w-5" /><span className="text-[11px]">Clients</span>
            </NavLink>
            <NavLink to="/trainer/profile" className={({isActive}) => `flex flex-col items-center justify-center py-2 ${isActive ? "text-yellow-300" : "text-gray-300"}`}>
              <User className="h-5 w-5" /><span className="text-[11px]">Profile</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
}