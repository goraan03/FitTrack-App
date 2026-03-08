import { UserPlus, Settings, Rocket, ArrowRight } from 'lucide-react';

const steps = [
  { number: '01', icon: UserPlus, title: 'Request Trainer Access', description: 'Contact us through the form below to request a trainer account. Our team will verify and set up your account.', color: 'amber' },
  { number: '02', icon: Settings, title: 'Set Up Your Business', description: "Add your clients, set your availability, and create your first training programs. We'll guide you through.", color: 'cyan' },
  { number: '03', icon: Rocket, title: 'Start Coaching Smarter', description: 'Your clients can book sessions, access programs, and track progress. You focus on what you do best—coaching.', color: 'violet' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-transparent to-cyan-400/5" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <Rocket className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Up and Running in <span className="bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent"> Minutes</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            No complex setup. No steep learning curve. Just get started and start managing your fitness business like a pro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-px bg-gradient-to-r from-[#27273a] via-[#27273a]/50 to-transparent">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#27273a]" />
                </div>
              )}

              <div className="group relative p-8 rounded-[2rem] bg-[#111118] border border-[#27273a] hover:border-amber-400/20 transition-all text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/10 to-cyan-400/10 border border-[#27273a] mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">{step.number}</span>
                </div>

                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    step.color === 'amber' ? 'bg-amber-400/10 text-amber-400' : step.color === 'cyan' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-violet-400/10 text-violet-400'
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
