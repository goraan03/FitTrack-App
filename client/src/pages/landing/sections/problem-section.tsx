import { X, FileSpreadsheet, Clock, Brain, AlertCircle, Calendar } from 'lucide-react';

const problems = [
  { icon: FileSpreadsheet, title: 'Spreadsheet Chaos', description: 'Client data scattered across Excel files, Google Sheets, and random notes. Finding what you need takes forever.' },
  { icon: Clock, title: 'Scheduling Nightmares', description: 'Back-and-forth messages to book sessions. Double bookings. Missed appointments. Sound familiar?' },
  { icon: Calendar, title: 'No Central System', description: 'Programs here, notes there, bookings everywhere. No single place to manage everything.' },
  { icon: Brain, title: 'Mental Overload', description: "Remembering every client's progress, preferences, and programs. Your brain shouldn't be your only database." },
  { icon: AlertCircle, title: 'No Clear Progress Tracking', description: 'Clients ask about their progress. You scramble to piece together their history from scattered records.' },
  { icon: X, title: 'Unprofessional Experience', description: 'Sending PDFs via email, manual invoices, no branded app. Your service deserves better.' },
];

export function ProblemSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2 mb-6">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold text-red-300 tracking-wide">The Problem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Being a Great Trainer Isn&apos;t Enough
            <span className="block text-slate-500 text-2xl sm:text-3xl lg:text-4xl mt-2">If Your Business is a Mess</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            You became a trainer to transform lives—not to drown in admin work. But without the right tools, chaos takes over.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-[#111118] border border-[#27273a] hover:border-red-500/20 hover:bg-red-500/[0.02] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <problem.icon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{problem.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xl text-slate-300 font-medium">
            There&apos;s a better way. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400">And it starts here.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
