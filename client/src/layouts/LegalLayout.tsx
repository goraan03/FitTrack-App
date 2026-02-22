import type React from "react";
import { ShieldCheck } from "lucide-react";

type Props = {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
};

export default function LegalLayout({
  badge = "FitTrack Policies",
  title,
  subtitle,
  children,
}: Props) {
  return (
    <section className="space-y-10 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* HERO / HEADER */}
      <div className="relative p-8 sm:p-14 lg:p-20 rounded-[2.5rem] border border-[#27273a] bg-[#111118] overflow-hidden shadow-2xl">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-amber-400/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-400/5 blur-[120px] rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 mb-8 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/80">
              {badge}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[1.05] uppercase italic">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-6 max-w-3xl text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-[#111118] border border-[#27273a] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-8">
        {children}
      </div>
    </section>
  );
}