import { Target, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 sm:px-6">
      
      {/* HERO / HEADER SECTION */}
      <div className="relative p-10 sm:p-20 rounded-[2.5rem] border border-[#27273a] bg-[#111118] overflow-hidden shadow-2xl">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-amber-400/5 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 mb-8">
            <Target className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/80">
              The Mission Behind FitTrack
            </span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-white leading-none uppercase italic">
            ABOUT <span className="text-amber-400">FITTRACK</span>
          </h1>
          
          <p className="mt-8 max-w-3xl text-slate-400 text-base sm:text-lg leading-relaxed font-medium">
            FitTrack is a premium web platform designed for personal trainers, gyms
            and online coaches. Our mission is to simplify your daily workflow: 
            from scheduling sessions to delivering structured programs — 
            eliminating administrative clutter so you can focus on the grind.
          </p>
        </div>
      </div>

      {/* TWO COLUMN SECTION: TRAINERS VS CLIENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FOR TRAINERS */}
        <div className="group bg-[#111118] border border-[#27273a] rounded-[2.5rem] p-8 sm:p-12 hover:border-amber-400/20 transition-all shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={120} className="text-amber-400" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Zap size={24} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">For Trainers</h2>
            </div>

            <div className="space-y-4 text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
              <p>
                FitTrack allows you to maintain complete records of your professional work in one place. 
                Easily create and organize training sessions, personalized programs, and specific 
                exercises for each client, complete with video demonstrations.
              </p>
              <p className="pt-2 border-t border-[#27273a]">
                After every session, you can leave ratings and feedback, giving your clients a crystal-clear 
                view of their progress. Our goal is to lift the 
                administrative burden off your shoulders.
              </p>
            </div>
          </div>
        </div>

        {/* FOR CLIENTS */}
        <div className="group bg-[#111118] border border-[#27273a] rounded-[2.5rem] p-8 sm:p-12 hover:border-cyan-400/20 transition-all shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Users size={120} className="text-cyan-400" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                <Users size={24} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">For Clients</h2>
            </div>

            <div className="space-y-4 text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
              <p>
                As a client, you get a clear overview of all your programs and exercises prepared 
                by your trainer, including detailed descriptions and video guides. 
                Book your sessions directly through the app based on your trainer's availability.
              </p>
              <p className="pt-2 border-t border-[#27273a]">
                Track exactly when you train, what to expect in each workout, and monitor your 
                performance trends. No more searching through messages and photos — everything 
                is centralized and always accessible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}