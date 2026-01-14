import { Link } from "react-router-dom";
import { Activity, Users, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src="/images/gym-hero.jpg"
          alt="Gym Hero"
          className="w-full h-full object-cover rounded-3xl"
        />
        <div className="absolute inset-0 bg-black/80 rounded-3xl" />
      </div>

      <div className="relative z-10 py-16 sm:py-20 px-4 sm:px-8 rounded-3xl bg-gradient-to-b from-black/70 to-black/90 border border-yellow-500/40 shadow-xl">
        {/* HERO */}
        <section className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] text-yellow-400 uppercase">
            Softver za trenere i klijente
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-yellow-500">FitTrack</span> – vodi svoj
            fitness biznis pametnije
          </h1>
          <p className="mt-5 text-gray-200 text-base sm:text-lg">
            Platforma za personalne trenere i studije: termini, programi,
            klijenti i naplata – sve na jednom mestu.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg bg-yellow-500 text-black px-6 py-3 font-bold hover:bg-yellow-400 transition shadow-lg"
            >
              Započni kao trener
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center rounded-lg border-2 border-yellow-500 text-yellow-300 px-6 py-3 font-bold hover:bg-yellow-500 hover:text-black transition"
            >
              Saznaj više
            </Link>
          </div>
        </section>

        {/* KRATKE PREDNOSTI */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Activity className="h-6 w-6" />}
            title="Manje administracije"
            text="Termini, klijenti i programi na jednom mestu – bez papira i haosa u porukama."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Jača veza sa klijentima"
            text="Jasan pregled termina, programa i povratnih informacija za svakog klijenta."
          />
          <FeatureCard
            icon={<Star className="h-6 w-6" />}
            title="Profesionalan nastup"
            text="Automatski računi, statistika rada i moderan sistem za tvoj brend."
          />
        </section>
      </div>
    </div>
  );
}

function FeatureCard(props: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-black/80 border border-yellow-500/50 rounded-xl p-5 shadow-lg text-center hover:translate-y-1 hover:shadow-yellow-500/20 transition">
      <div className="h-12 w-12 mx-auto rounded-full bg-yellow-100 text-black grid place-items-center mb-3">
        {props.icon}
      </div>
      <h3 className="text-base font-bold uppercase">{props.title}</h3>
      <p className="text-gray-300 mt-2 text-sm">{props.text}</p>
    </div>
  );
}