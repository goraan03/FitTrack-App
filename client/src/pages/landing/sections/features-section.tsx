import { Users, Calendar, TrendingUp, Dumbbell, Zap, Shield } from 'lucide-react';

const features = [
  { icon: Users, title: 'Client Management', description: 'Keep all your clients organized in one place. View profiles, track history, and manage relationships effortlessly.', gradient: 'from-amber-400 to-amber-600', bgGlow: 'bg-amber-400/20' },
  { icon: Calendar, title: 'Smart Scheduling', description: 'Set your availability, let clients book online, and never double-book again. Automatic reminders included.', gradient: 'from-cyan-400 to-cyan-600', bgGlow: 'bg-cyan-400/20' },
  { icon: Dumbbell, title: 'Training Programs', description: 'Build professional workout programs with exercises, sets, reps, and video demos. Assign to clients in seconds.', gradient: 'from-violet-400 to-violet-600', bgGlow: 'bg-violet-400/20' },
  { icon: TrendingUp, title: 'Progress Tracking', description: 'Track client progress with visual charts. Celebrate wins and identify areas for improvement.', gradient: 'from-emerald-400 to-emerald-600', bgGlow: 'bg-emerald-400/20' },
];

const additionalFeatures = [
  { icon: Zap, text: 'Instant notifications' },
  { icon: Shield, text: 'Secure data storage' },
  { icon: Calendar, text: 'Calendar sync' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">Features</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Everything You Need to
            <span className="block bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">Coach Like a Pro</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            Powerful fitness trainer software features designed specifically for personal trainers and fitness coaches. Our coaching management
            platform eliminates complexity—just tools that work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-[2rem] bg-[#111118] border border-[#27273a] hover:border-amber-400/20 transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 ${feature.bgGlow} rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-6`}>
                  <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111118] border border-[#27273a]">
              <feature.icon className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
