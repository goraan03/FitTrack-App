import { Link } from "react-router-dom";
import { Activity, Users, Star, Mail, ShieldCheck, CalendarDays, BarChart3, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <section className="space-y-10 pb-20 px-4 sm:px-6 max-w-7xl mx-auto opacity-0 animate-fade-in-up">
      
      {/* HERO SECTION */}
      <div className="relative min-h-[500px] flex items-center justify-center rounded-[2.5rem] border border-[#27273a] bg-[#111118] overflow-hidden shadow-2xl opacity-0 animate-fade-in-up">
        
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-400/5 blur-[120px] rounded-full" />

        <div className="relative z-10 w-full px-6 py-16 sm:px-12 text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 mb-8 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/80">
              Training Management Platform
            </span>
          </div>

          {/* Glavni Naslov */}
          <h1 className="max-w-4xl text-4xl sm:text-6xl font-black tracking-tighter text-white leading-[1.1] uppercase italic">
            FITTRACK <span className="text-amber-400">DASHBOARD</span>
          </h1>
          
          <h2 className="mt-4 max-w-2xl text-lg sm:text-xl font-bold text-slate-300 tracking-tight">
            Stay aligned — sessions, programs, and progress in one place.
          </h2>

          {/* Opis */}
          <p className="mt-6 max-w-xl text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
            A clean workflow for scheduling, program delivery, and tracking performance — built for real training businesses.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 bg-amber-400 text-[#0a0a0f] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/10 hover:scale-105 transition-all active:scale-95"
            >
              <CalendarDays className="w-4 h-4" />
              Create Client Account
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 bg-white/[0.03] border border-[#27273a] text-slate-300 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Mail className="w-4 h-4" />
              Trainer Access
            </Link>
          </div>

          {/* Admin Note */}
          <div className="mt-8 flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            Official Trainer accounts are managed by Admin
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "120ms", animationFillMode: "forwards" }}>
        <MiniStat icon={<Activity className="w-5 h-5 text-amber-400" />} label="Sessions" value="Scheduling & capacity" color="border-amber-400/20" />
        <MiniStat icon={<Users className="w-5 h-5 text-cyan-400" />} label="Clients" value="Progress & history" color="border-cyan-400/20" />
        <MiniStat icon={<BarChart3 className="w-5 h-5 text-violet-400" />} label="Insights" value="Trends & feedback" color="border-violet-400/20" />
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "220ms", animationFillMode: "forwards" }}>
        <FeatureCard
          icon={<CalendarDays className="h-6 w-6" />}
          title="Scheduling that stays organized"
          text="Set available sessions, manage capacity, and keep bookings under control — everything stays in one calendar flow."
        />
        <FeatureCard
          icon={<Users className="h-6 w-6" />}
          title="Programs clients actually follow"
          text="Create structured programs, assign them in seconds, and keep clients consistent with clear workout guidance."
        />
        <FeatureCard
          icon={<Star className="h-6 w-6" />}
          title="Professional experience"
          text="A clean, modern look that makes your service feel premium and trustworthy — from day one."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "320ms", animationFillMode: "forwards" }}>
        <FeatureCard
          icon={<Activity className="h-6 w-6" />}
          title="Clear workouts, better adherence"
          text="Exercise details are easy to follow, so clients know exactly what to do and you spend less time explaining basics."
        />
        <FeatureCard
          icon={<BarChart3 className="h-6 w-6" />}
          title="Progress & ratings"
          text="See trends over time, collect feedback, and make coaching decisions based on real signals — not guesswork."
        />
      </div>
    </section>
  );
}

// POMOĆNE KOMPONENTE - Sređene da prate Trainer Layout

function FeatureCard(props: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-[#111118] border border-[#27273a] rounded-[2rem] p-8 shadow-2xl hover:border-amber-400/20 transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-[#0a0a0f] border border-[#27273a] grid place-items-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
        {props.icon}
      </div>
      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-3 italic">
        {props.title}
      </div>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">
        {props.text}
      </p>
    </div>
  );
}

function MiniStat(props: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={`bg-[#111118] border ${props.color} rounded-[2rem] p-6 shadow-xl relative overflow-hidden group`}>
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-[#0a0a0f] border border-[#27273a] grid place-items-center">
          {props.icon}
        </div>
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-1 group-hover:text-white transition-colors">
            {props.label}
          </span>
          <div className="text-xs font-bold text-slate-300">{props.value}</div>
        </div>
      </div>
    </div>
  );
}