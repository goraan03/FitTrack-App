import { Link } from "react-router-dom";
import { Activity, Users, Star } from "lucide-react";
import Brand from "../../components/common/Brand";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* HERO Background */}
      <div className="absolute inset-0">
        <img
          src="/images/gym-hero.jpg" // ubaci pravu sliku u /public/images/
          alt="Gym Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 relative bg-black/90 border-b border-yellow-500">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Brand />

          <nav className="hidden sm:flex items-center gap-8 text-sm font-semibold uppercase">
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO TEXT */}
        <section className="flex flex-col items-center justify-center text-center pt-28 sm:pt-32">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wide uppercase">
            <span className="text-yellow-500">Drugačiji</span> koncept vežbanja
          </h1>
          <p className="mt-5 text-gray-200 text-lg max-w-3xl mx-auto">
            Treniraj sa najboljima, koristi najsavremeniju opremu i doživi novu
            dimenziju fitness iskustva.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg bg-yellow-500 text-black px-6 py-3 font-bold hover:bg-yellow-400 transition shadow-lg"
            >
              Postani član
            </Link>
            <Link
              to="/programs"
              className="inline-flex items-center rounded-lg border-2 border-yellow-500 text-yellow-500 px-6 py-3 font-bold hover:bg-yellow-500 hover:text-black transition"
            >
              Pogledaj programe
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-28">
          <h2 className="text-center text-3xl font-extrabold text-yellow-500 uppercase">
            Zašto izabrati FitTrack?
          </h2>
          <p className="text-center text-gray-300 mt-2">
            Sve što ti je potrebno na tvom fitness putu
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black border-2 border-yellow-500 rounded-xl p-6 shadow-lg text-center hover:scale-105 transition">
              <div className="h-12 w-12 mx-auto rounded-full bg-yellow-100 text-black grid place-items-center mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold uppercase">
                Praćenje napretka
              </h3>
              <p className="text-gray-300 mt-2 text-sm">
                Pregledan prikaz napretka, statistika i planova.
              </p>
            </div>

            <div className="bg-black border-2 border-yellow-500 rounded-xl p-6 shadow-lg text-center hover:scale-105 transition">
              <div className="h-12 w-12 mx-auto rounded-full bg-yellow-100 text-black grid place-items-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold uppercase">Stručni treneri</h3>
              <p className="text-gray-300 mt-2 text-sm">
                Radi sa sertifikovanim trenerima.
              </p>
            </div>

            <div className="bg-black border-2 border-yellow-500 rounded-xl p-6 shadow-lg text-center hover:scale-105 transition">
              <div className="h-12 w-12 mx-auto rounded-full bg-yellow-100 text-black grid place-items-center mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold uppercase">Raznovrsni programi</h3>
              <p className="text-gray-300 mt-2 text-sm">
                Programi prilagođeni tvojim ciljevima.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 py-8 text-center text-sm text-gray-400 border-t border-yellow-500">
          © {new Date().getFullYear()} FitTrack App. Sva prava zadržana.
        </footer>
      </main>
    </div>
  );
}