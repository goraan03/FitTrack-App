import { Link, NavLink, Outlet } from "react-router-dom";
import Brand from "../components/common/Brand";
import { Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Footer from "../components/public/Footer";

const linkBase = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
const linkActive = "bg-amber-400/10 text-amber-400";
const linkIdle = "text-slate-400 hover:text-white hover:bg-white/5";

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isMenuOpen]);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/guide", label: "Guide" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black font-sans">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#27273a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand text="FitTrack" />

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                {l.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              LOG IN
            </Link>
            <Link to="/register" className="bg-amber-400 hover:bg-amber-500 text-[#0a0a0f] px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              REGISTER
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-lg bg-white/5 border border-[#27273a] text-slate-400">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 z-[90] lg:hidden bg-[#0a0a0f] transition-all duration-500 ease-in-out ${isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
        <div className="flex flex-col h-full pt-24 pb-10 px-6">
          <div className="flex flex-col gap-2">
            {nav.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={closeMenu}
                className={({ isActive }) => `flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${isActive ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "text-slate-400 border border-transparent"}`}
              >
                {({ isActive }) => (
                  <>
                    <span className="text-lg font-bold uppercase tracking-tight">{l.label}</span>
                    <ChevronRight size={18} className={isActive ? "opacity-100" : "opacity-20"} />
                  </>
                )}
              </NavLink>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <Link to="/login" onClick={closeMenu} className="w-full py-4 text-center text-slate-400 font-bold uppercase tracking-widest border border-[#27273a] rounded-2xl">Log In</Link>
            <Link to="/register" onClick={closeMenu} className="w-full py-4 text-center bg-amber-400 text-[#0a0a0f] font-bold uppercase tracking-widest rounded-2xl shadow-lg">Register Now</Link>
          </div>
        </div>
      </div>

      <main className="relative pt-24">
        <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}