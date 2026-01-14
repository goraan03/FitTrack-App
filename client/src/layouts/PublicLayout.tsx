import { Link, Outlet } from "react-router-dom";
import Brand from "../components/common/Brand";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-black/90 border-b border-yellow-500/80 backdrop-blur">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Brand />
          <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold uppercase">
            <Link to="/" className="text-gray-200 hover:text-yellow-400">
              Početna
            </Link>
            <Link to="/about" className="text-gray-200 hover:text-yellow-400">
              O aplikaciji
            </Link>
            <Link to="/guide" className="text-gray-200 hover:text-yellow-400">
              Uputstvo
            </Link>
            <Link to="/contact" className="text-gray-200 hover:text-yellow-400">
              Kontakt
            </Link>
            <Link to="/login" className="text-white hover:text-yellow-400">
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg bg-yellow-500 text-black px-5 py-2 font-bold shadow hover:bg-yellow-400 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-yellow-500/50 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} FitTrack App. Sva prava zadržana.
      </footer>
    </div>
  );
}