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
  LogOut 
} from "lucide-react";

const linkBase = "relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300";
const linkActive = "text-yellow-400 bg-white/5 shadow-[0_0_15px_rgba(250,204,21,0.1)] border border-yellow-400/20";
const linkIdle = "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent";

export default function TrainerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const doLogout = () => { 
    logout(); 
    navigate("/login", { replace: true }); 
  };

  const nav = [
    { to: "/trainer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/trainer/exercises", label: "Exercises", icon: Dumbbell },
    { to: "/trainer/programs", label: "Programs", icon: ListChecks },
    { to: "/trainer/terms", label: "Terms", icon: CalendarDays },
    { to: "/trainer/clients", label: "Clients", icon: Users },
    { to: "/trainer/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-gray-100 selection:bg-yellow-400 selection:text-black">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* LEVO: Brand */}
          <div className="flex-shrink-0">
            <Brand text="FitTrack"/>
          </div>
          
          {/* CENTAR: Desktop Navigation (Sada zauzima sredinu) */}
          <nav className="hidden xl:flex items-center justify-center gap-1 flex-1">
            {nav.map(l => (
              <NavLink 
                key={l.to} 
                to={l.to} 
                className={({isActive}) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* DESNO: Logout dugme */}
          <div className="flex-shrink-0">
            <button
              onClick={doLogout}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300"
            >
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest group-hover:text-red-500">Logout</span>
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 sm:pb-12">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="sm:hidden fixed bottom-6 inset-x-4 z-50">
        <div className="bg-[#161616]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="grid grid-cols-6 items-center">
            {nav.map(l => (
              <NavLink 
                key={l.to}
                to={l.to} 
                className={({isActive}) => `
                  flex flex-col items-center justify-center py-3 px-1 transition-all duration-300
                  ${isActive ? "text-yellow-400 bg-white/5" : "text-gray-500 hover:text-gray-300"}
                `}
              >
                {({isActive}) => (
                  <>
                    <l.icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                    <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter truncate w-full text-center">
                      {l.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}