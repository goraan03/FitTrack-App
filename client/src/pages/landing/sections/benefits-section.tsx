import { Clock, TrendingUp, CheckCircle, Heart, Sparkles } from 'lucide-react';

const benefits = [
  { icon: Clock, title: 'Save 5+ Hours Per Week', description: 'Automate scheduling, client management, and program delivery. Spend less time on admin, more time coaching.', stat: '5+', statLabel: 'hours saved weekly', gradient: 'from-amber-400 to-amber-600' },
  { icon: TrendingUp, title: 'Grow Your Client Base', description: 'Professional tools help you deliver better service. Happy clients refer more clients. Watch your business grow.', stat: 'Faster', statLabel: 'client growth', gradient: 'from-cyan-400 to-cyan-600' },
  { icon: CheckCircle, title: 'Stay Organized Always', description: 'Everything in one place. No more scattered data, lost messages, or forgotten sessions. Total clarity.', stat: '100%', statLabel: 'organized', gradient: 'from-violet-400 to-violet-600' },
  { icon: Heart, title: 'Deliver Premium Experience', description: "Your clients get a professional portal to access programs, book sessions, and track progress. They'll love it.", stat: 'Pro', statLabel: 'client experience', gradient: 'from-emerald-400 to-emerald-600' },
];

export function BenefitsSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">Benefits</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Transform How You
            <span className="block bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">Run Your Business</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            TrainMeter isn&apos;t just fitness trainer software—it&apos;s your competitive advantage. Here&apos;s what trainers experience when they switch to our client
            tracking software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-[2rem] bg-[#111118] border border-[#27273a] hover:border-amber-400/20 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${benefit.gradient} rounded-full blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-[1px] mb-6`}>
                    <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{benefit.description}</p>
                </div>

                <div className="lg:text-right">
                  <div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent`}>
                    {benefit.stat}
                  </div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider mt-1">{benefit.statLabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
