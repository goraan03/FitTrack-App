import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuthHook";
import { ShieldCheck, UserPlus, Users, FileText, LogOut, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import BackgroundFX from "../components/common/BackgroundFX";

const linkBase = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] font-medium";
const linkActive = "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
const linkIdle = "text-gray-700 hover:text-emerald-700 hover:bg-emerald-50";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const nav = [
    { to: "/admin/create-trainer", label: "Create Trainer", icon: UserPlus },
    { to: "/admin/users", label: "User List", icon: Users },
    { to: "/admin/audit", label: "Audit Log", icon: FileText },
  ];

  const NavLinks = () => (
    <div className="flex flex-col sm:flex-row gap-2">
      {nav.map((n) => {
        const Icon = n.icon;
        return (
          <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            <Icon className="h-4 w-4" /> {n.label}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <BackgroundFX />

      {/* Top bar */}
      <header className="sticky top-0 z-40 relative backdrop-blur-md bg-white/70 supports-[backdrop-filter]:bg-white/55">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/40" />
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button ref={burgerRef} onClick={() => setOpen((o) => !o)} className="sm:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white grid place-items-center shadow">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-emerald-700">FitTrack Admin</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <NavLinks />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-600">{user?.korisnickoIme}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>

        {/* mobile drawer */}
        {open && (
          <div className="sm:hidden bg-white/85 backdrop-blur-md shadow-[inset_0_1px_0_rgba(17,24,39,0.06)]">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <NavLinks />
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
