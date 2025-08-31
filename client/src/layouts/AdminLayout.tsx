import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/auth/useAuthHook";
import { Menu, X, UserPlus, Users, FileText, LogOut, ShieldCheck } from "lucide-react";

const linkBase =
  "group flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ring-1 ring-transparent transition";
const linkActive =
  "bg-indigo-600 text-white shadow ring-indigo-600";
const linkIdle =
  "text-gray-800 hover:text-indigo-700 hover:bg-indigo-50";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => closeRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const closeDrawer = () => {
    setOpen(false);
    requestAnimationFrame(() => burgerRef.current?.focus());
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const nav = [
    { to: "/admin/create-trainer", label: "Kreiranje trenera", icon: UserPlus },
    { to: "/admin/users", label: "Lista korisnika", icon: Users },
    { to: "/admin/audit", label: "Audit log", icon: FileText },
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="px-6 py-6 border-b">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shadow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold leading-6">FitTrack Admin</div>
            <div className="text-sm text-gray-500 leading-5 truncate max-w-[200px]">
              {user ? user.korisnickoIme : "—"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-5 space-y-3 overflow-y-auto">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[1.05rem]">{n.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-5 border-t">
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold transition"
        >
          <LogOut className="h-5 w-5" />
          Odjava
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[320px] bg-white border-r shadow-sm">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 bg-white border-b shadow-sm">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            ref={burgerRef}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-lg font-semibold">FitTrack Admin</div>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={closeDrawer}
        />
        <aside
          role="dialog"
          aria-modal="true"
          className={`absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-white shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="absolute right-3 top-3">
            <button
              ref={closeRef}
              onClick={closeDrawer}
              aria-label="Close menu"
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {SidebarContent}
        </aside>
      </div>

      {/* Content */}
      <section className="flex-1 min-w-0">
        <div className="lg:hidden h-16" />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </section>
    </div>
  );
}