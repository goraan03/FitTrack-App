import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Brand from "../components/common/Brand";
import { useAuth } from "../hooks/auth/useAuthHook";
import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  CalendarDays,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";

const linkBase = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
const linkActive = "bg-amber-400/10 text-amber-400";
const linkIdle = "text-slate-400 hover:text-white hover:bg-white/5";

export default function TrainerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme, language, setLanguage, t } = useSettings();
  const langs = ['English', 'Serbian', 'Russian', 'German', 'Hungarian'] as const;

  const closeMenu = () => setIsMenuOpen(false);

  const doLogout = () => {
    closeMenu();
    logout();
    navigate("/login", { replace: true });
  };

  // Spreči skrolovanje dok je meni otvoren
  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isMenuOpen]);

  const nav = [
    { to: "/trainer/dashboard", label: t('nav_dashboard') || "Dashboard", icon: LayoutDashboard },
    { to: "/trainer/exercises", label: t('nav_exercises') || "Exercises", icon: Dumbbell },
    { to: "/trainer/programs", label: t('nav_programs') || "Programs", icon: ListChecks },
    { to: "/trainer/terms", label: t('nav_sessions') || "Sessions", icon: CalendarDays },
    { to: "/trainer/clients", label: t('nav_clients') || "Clients", icon: Users },
    { to: "/trainer/profile", label: t('nav_profile') || "Profile", icon: User },

  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black font-sans">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#27273a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand text="TrainoraX" />

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
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

          {/* DESKTOP CONTROLS */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={doLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('logout').toUpperCase()}
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/5 border border-[#27273a] text-slate-400"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`
        fixed inset-0 z-[90] lg:hidden bg-[#0a0a0f] transition-all duration-500 ease-in-out
        ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}>
        <div className="flex flex-col h-full pt-24 pb-10 px-6">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-4 mb-2">{t('trainer_menu')}</p>
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
                      {t(l.label.toLowerCase()).toUpperCase()}
                    </div>
                    <ChevronRight size={18} className={isActive ? "opacity-100" : "opacity-20"} />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Mobile theme/lang controls */}
          <div className="mt-6 flex items-center gap-3 px-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-[#27273a] text-slate-400 font-bold text-sm uppercase tracking-wider"
            >
              {theme === 'dark' ? t('light') : t('dark')}
            </button>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-[#27273a] text-slate-400 font-bold text-sm uppercase tracking-wider text-center appearance-none cursor-pointer"
            >
              {langs.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="mt-auto">
            <button
              onClick={doLogout}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 font-bold uppercase tracking-widest"
            >
              <LogOut size={18} />
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <main className="relative pt-24 pb-12 px-4 sm:px-6">
        <div className="relative max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
