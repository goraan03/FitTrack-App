import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';

export function CTASection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-[150px]" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center p-12 lg:p-16 rounded-[2.5rem] bg-[#111118] border border-[#27273a]">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">Start Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Fitness Business?
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 text-pretty">
            Join trainers who&apos;ve already made the switch. Contact us today to get started.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#0a0a0f] border-0 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-105 group font-semibold"
              asChild
            >
              <a href="#contact">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base bg-white/5 border-[#27273a] text-white hover:bg-white/10 hover:border-amber-400/20" asChild>
              <a href="#contact">Schedule a Demo</a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span>No hidden fees</span>
            <span>Cancel anytime</span>
            <span>Secure &amp; private</span>
          </div>
        </div>
      </div>
    </section>
  );
}
