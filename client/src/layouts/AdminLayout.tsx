import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuthHook";
import { ShieldCheck, UserPlus, Users, FileText, LogOut, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const linkBase = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] font-medium transition";
const linkActive = "text-yellow-300 ring-1 ring-yellow-400/60 bg-yellow-400/10";
const linkIdle = "text-gray-300 hover:text-yellow-300 hover:bg-yellow-400/5";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const nav = [
    { to: "/admin/create-trainer", label: "Create Trainer", icon: UserPlus },
    { to: "/admin/users", label: "User List", icon: Users },
    { to: "/admin/audit", label: "Audit Log", icon: FileText },
    { to: "/admin/invoices", label: "Invoices", icon: FileText },
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
    <div className="bg-black min-h-screen text-white">
      <header className="sticky top-0 z-40 bg-black border-b border-yellow-400/70">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button ref={burgerRef} onClick={() => setOpen((o) => !o)} className="sm:hidden p-2 rounded-lg hover:bg-yellow-400/10">
              <Menu className="h-6 w-6" />
            </button>
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-yellow-500 text-black grid place-items-center shadow">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-yellow-300">FitTrack Admin</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <NavLinks />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-300">{user?.korisnickoIme}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-500/90 text-black"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>

        {open && (
          <div className="sm:hidden bg-black/80 backdrop-blur md:shadow-none border-t border-yellow-400/20">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <NavLinks />
            </div>
          </div>
        )}
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(700px_250px_at_10%_0%,rgba(253,224,71,0.07),transparent),radial-gradient(600px_250px_at_90%_10%,rgba(253,224,71,0.05),transparent)]" />
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}