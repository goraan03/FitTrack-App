import { CheckCircle2 } from 'lucide-react';

export function SeoIntroSection() {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-[#27273a]/50 scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d14]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="prose prose-invert max-w-none">
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 text-pretty">
              <strong className="text-white">TrainMeter</strong> is the leading <span className="text-amber-400">personal trainer software</span> designed to
              help fitness professionals streamline their coaching business. Our comprehensive <span className="text-amber-400">fitness coaching platform</span> provides
              everything you need for efficient <span className="text-cyan-400">client management for trainers</span>, from organizing your workout programs to tracking client
              progress in real-time.
            </p>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed text-pretty">
              With our powerful <span className="text-cyan-400">trainer scheduling software</span>, you can automate bookings, send reminders, and manage your entire
              client roster from one intuitive dashboard. Whether you&apos;re an independent personal trainer, a fitness coach working at a gym, or running your own
              training studio, TrainMeter&apos;s <span className="text-amber-400">coaching management platform</span> gives you the tools to save time, stay organized, and grow your
              business. Our <span className="text-cyan-400">client tracking software for trainers</span> makes it easy to monitor progress and deliver results.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {["Built for personal trainers", "Easy client management", "Smart scheduling", "Progress tracking"].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
