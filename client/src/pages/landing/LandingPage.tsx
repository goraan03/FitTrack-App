import { Link } from "react-router-dom";
import { Activity, Users, Star } from "lucide-react";
import Brand from "../../components/common/Brand";
import BackgroundFX from "../../components/common/BackgroundFX";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFX />

      <header className="sticky top-0 z-40 relative backdrop-blur-md bg-white/70 supports-[backdrop-filter]:bg-white/55">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/40" />
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Brand />
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link to="/login" className="text-gray-700 hover:text-emerald-700">Sign In</Link>
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="pt-14 sm:pt-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-700 to-emerald-400 bg-clip-text text-transparent">
              Transform Your Fitness
            </span>{" "}
            Journey
          </h1>
          <p className="mt-5 text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with professional trainers, track your progress, and achieve your goals.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-5 py-3 font-semibold hover:bg-emerald-700 transition shadow"
            >
              Start Your Journey
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg bg-white text-gray-800 px-5 py-3 font-semibold ring-1 ring-gray-200 hover:bg-gray-50 transition"
            >
              Create Account
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mt-14 sm:mt-20">
          <h2 className="text-center text-2xl font-extrabold">Why Choose FitTrack?</h2>
          <p className="text-center text-gray-600 mt-2">Everything you need for your fitness journey</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Track Your Progress</h3>
              <p className="text-gray-600 mt-2 text-sm">Detailed analytics and progress tracking.</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Expert Trainers</h3>
              <p className="text-gray-600 mt-2 text-sm">Work with certified trainers.</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center mb-4">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Diverse Programs</h3>
              <p className="text-gray-600 mt-2 text-sm">Programs tailored to your needs.</p>
            </div>
          </div>
        </section>

        <footer className="mt-16 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FitTrack. All rights reserved.
        </footer>
      </main>
    </div>
  );
}