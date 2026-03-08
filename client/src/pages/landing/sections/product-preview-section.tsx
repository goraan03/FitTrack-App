import { Monitor, Smartphone, Users, Calendar, Dumbbell, TrendingUp, ChevronRight, Play } from 'lucide-react';

export function ProductPreviewSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-amber-400/5 via-cyan-400/5 to-amber-400/5 rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">Product Preview</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Beautiful Design.
            <span className="block bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">Powerful Functionality.</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            A premium interface that makes your business look professional. Your clients will love it—and so will you.
          </p>
        </div>

        <div className="relative mb-20">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-cyan-400/20 to-amber-400/20 rounded-3xl blur-2xl opacity-50" />

          <div className="relative bg-[#111118] rounded-2xl border border-[#27273a] overflow-hidden shadow-2xl">
            <div className="h-12 bg-[#0a0a0f] border-b border-[#27273a] flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-slate-500 font-medium">Trainer Dashboard</div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="hidden lg:block space-y-2">
                  {[
                    { icon: Monitor, label: 'Dashboard', active: true },
                    { icon: Users, label: 'Clients', active: false },
                    { icon: Calendar, label: 'Schedule', active: false },
                    { icon: Dumbbell, label: 'Programs', active: false },
                    { icon: TrendingUp, label: 'Progress', active: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                        item.active
                          ? 'bg-gradient-to-r from-amber-400/10 to-cyan-400/10 border border-amber-400/20 text-white'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                      } transition-all cursor-pointer`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Active Clients', value: '24', change: '+3', color: 'amber' },
                      { label: 'This Week', value: '18', subtitle: 'sessions', color: 'cyan' },
                      { label: 'Programs', value: '12', subtitle: 'active', color: 'violet' },
                    ].map((stat, i) => (
                      <div key={i} className={`stat-card-${stat.color} rounded-xl p-4`}>
                        <div className="text-xs text-slate-500 mb-2">{stat.label}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white">{stat.value}</span>
                          {stat.change && <span className="text-xs text-emerald-400">{stat.change}</span>}
                          {stat.subtitle && <span className="text-xs text-slate-500">{stat.subtitle}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#0a0a0f] rounded-xl p-5 border border-[#27273a]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-white">Today&apos;s Sessions</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="space-y-3">
                        {[
                          { time: '09:00', name: 'Sarah J.', type: 'Strength', color: 'amber' },
                          { time: '11:00', name: 'Mike C.', type: 'HIIT', color: 'cyan' },
                          { time: '14:00', name: 'Emma D.', type: 'Personal', color: 'violet' },
                        ].map((session, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-[#27273a]">
                            <div className={`w-1 h-8 rounded-full ${session.color === 'amber' ? 'bg-amber-400' : session.color === 'cyan' ? 'bg-cyan-400' : 'bg-violet-400'}`} />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{session.name}</div>
                              <div className="text-xs text-slate-500">{session.type}</div>
                            </div>
                            <div className="text-xs text-slate-400">{session.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0a0a0f] rounded-xl p-5 border border-[#27273a]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-white">Recent Activity</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="space-y-3">
                        {[
                          { action: 'New booking', detail: 'Sarah booked Friday 10am', time: '2m ago' },
                          { action: 'Program completed', detail: 'Mike finished Week 4', time: '1h ago' },
                          { action: 'New client', detail: 'Alex joined your roster', time: '3h ago' },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-[#27273a]">
                            <div className="w-2 h-2 rounded-full bg-amber-400 mt-2" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{activity.action}</div>
                              <div className="text-xs text-slate-500">{activity.detail}</div>
                            </div>
                            <div className="text-xs text-slate-500">{activity.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111118] border border-[#27273a]">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">Desktop App</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111118] border border-[#27273a]">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">Mobile Responsive</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111118] border border-[#27273a]">
            <Play className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-300">Client Portal</span>
          </div>
        </div>
      </div>
    </section>
  );
}
