import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Brand from "../components/common/Brand";
import { useAuth } from "../hooks/auth/useAuthHook";
import { 
  LayoutDashboard, 
  CalendarDays, 
  ListChecks, 
  UserRound, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight 
} from "lucide-react";
import { useState, useEffect } from "react";

const linkBase =
  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
const linkActive = "bg-amber-400/10 text-amber-400";
const linkIdle = "text-slate-400 hover:text-white hover:bg-white/5";

export default function ClientLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const doLogout = () => {
    closeMenu();
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isMenuOpen]);

  const nav = [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/sessions", label: "Sessions", icon: CalendarDays },
    { to: "/app/programs", label: "Programs", icon: ListChecks },
    { to: "/app/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
      {/* TOP NAV */}
      <header className="fixed top-0 left-0 right-0 z-[100] glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brand text="FitTrack" />
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {nav.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  <l.icon className="w-4 h-4" />
                  {l.label.toUpperCase()}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={doLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                LOGOUT
              </button>

              {/* HAMBURGER DUGME */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 border border-[#27273a] text-slate-400"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`
        fixed inset-0 z-[90] md:hidden bg-[#0a0a0f] transition-all duration-500 ease-in-out
        ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}>
        <div className="flex flex-col h-full pt-24 pb-10 px-6">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-4 mb-2">Member Menu</p>
            {nav.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={closeMenu}
                className={({ isActive }) => `
                  flex items-center justify-between px-6 py-4 rounded-2xl transition-all
                  ${isActive ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "text-slate-400 border border-transparent"}
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-4 text-lg font-bold">
                      <l.icon size={20} />
                      {l.label.toUpperCase()}
                    </div>
                    <ChevronRight size={18} className={isActive ? "opacity-100" : "opacity-20"} />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto">
            <button
              onClick={doLogout}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 font-bold uppercase tracking-widest"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <main className="pt-20 pb-32 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}