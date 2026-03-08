import { Check, Sparkles } from 'lucide-react';

const solutions = [
  { before: 'Scattered client data', after: 'All clients in one organized dashboard' },
  { before: 'Manual scheduling via messages', after: 'Online booking with automatic reminders' },
  { before: 'Progress tracked in your head', after: 'Visual progress charts and history' },
  { before: 'Programs sent as PDFs', after: 'Interactive programs clients can access anytime' },
  { before: 'No central system', after: 'Everything in one professional platform' },
  { before: 'Hours spent on admin', after: 'Automated workflows, more time coaching' },
];

export function SolutionSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f] to-[#0a0a0f]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-400/5 to-cyan-400/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">The Solution</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            One Platform to Run Your
            <span className="block bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">Entire Fitness Business</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            TrainoraX replaces the chaos with clarity. Everything you need to manage clients, deliver programs, and grow your business—in one
            beautiful platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative">
              <div className="sticky top-24">
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Before TrainoraX</span>
                </div>
                <div className="space-y-4">
                  {solutions.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/[0.03] border border-red-500/10">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 text-sm font-bold">X</span>
                      </div>
                      <span className="text-slate-400 line-through decoration-red-500/50">{item.before}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="sticky top-24">
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">With TrainoraX</span>
                </div>
                <div className="space-y-4">
                  {solutions.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:bg-emerald-500/[0.05] hover:border-emerald-500/20 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-white font-medium">{item.after}</span>
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
