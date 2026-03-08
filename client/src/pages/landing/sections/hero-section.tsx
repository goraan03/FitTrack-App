import { ArrowRight, Play, Users, Calendar, Activity, BarChart3 } from 'lucide-react';
import { Button } from '../components/Button';

export function HeroSection() {
  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[150px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[150px] animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-400/5 to-cyan-400/5 rounded-full blur-[200px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-400/30 bg-[#0a0a0f]/80 px-4 py-2 mb-8 backdrop-blur-sm animate-fade-in-up shadow-[0_0_20px_rgba(251,191,36,0.12)]">
            <img src="/images/fittrack-brand-36.png" alt="TrainoraX badge" className="h-7 w-7 rounded-lg" loading="lazy" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">#1 Personal Trainer Software</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 animate-fade-in-up text-balance"
            style={{ animationDelay: '0.1s' }}
          >
            Personal Trainer
            <span className="block mt-2 bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Management Software
            </span>
          </h1>

          <h2 className="text-xl sm:text-2xl text-slate-300 font-medium mb-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            The All-in-One Fitness Coaching Platform
          </h2>

          <p
            className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 animate-fade-in-up text-pretty"
            style={{ animationDelay: '0.2s' }}
          >
            Manage your fitness clients, schedule training sessions, track progress, and grow your coaching business—all in one powerful
            platform designed specifically for personal trainers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#0a0a0f] border-0 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-105 group font-semibold"
              asChild
            >
              <a href="#contact">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-8 text-base bg-white/5 border-[#27273a] text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm group"
              asChild
            >
              <a href="#contact">
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Request Demo
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-slate-400 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-[#27273a]">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Client Management</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-[#27273a]">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Session Scheduling</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-[#27273a]">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Progress Tracking</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-[#27273a]">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Training Programs</span>
            </div>
          </div>
        </div>

        <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-cyan-400/20 to-amber-400/20 rounded-3xl blur-2xl opacity-50" />
          <div className="relative bg-[#111118] rounded-2xl border border-[#27273a] overflow-hidden shadow-2xl">
            <div className="h-12 bg-[#0a0a0f] border-b border-[#27273a] flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-slate-500 font-medium">app.trainorax.io</div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-b from-[#111118] to-[#0a0a0f]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat-card-amber rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Clients</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">24</div>
                  <div className="text-xs text-emerald-400 mt-1">+3 this month</div>
                </div>
                <div className="stat-card-cyan rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">This Week</span>
                    <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">18</div>
                  <div className="text-xs text-slate-500 mt-1">Sessions scheduled</div>
                </div>
                <div className="stat-card-violet rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Programs</span>
                    <div className="w-8 h-8 rounded-lg bg-violet-400/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-violet-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">12</div>
                  <div className="text-xs text-emerald-400 mt-1">Active programs</div>
                </div>
              </div>

              <div className="bg-[#0a0a0f] rounded-xl p-5 border border-[#27273a]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white">Today&apos;s Schedule</span>
                  <span className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US')}</span>
                </div>
                <div className="space-y-3">
                  {[
                    { time: '09:00 AM', client: 'Sarah Johnson', type: 'Strength Training', color: 'amber' },
                    { time: '11:00 AM', client: 'Mike Chen', type: 'HIIT Session', color: 'cyan' },
                    { time: '02:00 PM', client: 'Emma Davis', type: 'Personal Training', color: 'violet' },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-[#27273a]">
                      <div className={`w-1 h-10 rounded-full ${
                        session.color === 'amber' ? 'bg-amber-400' : session.color === 'cyan' ? 'bg-cyan-400' : 'bg-violet-400'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{session.client}</div>
                        <div className="text-xs text-slate-500">{session.type}</div>
                      </div>
                      <div className="text-xs font-medium text-slate-400">{session.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
