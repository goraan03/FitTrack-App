import { Check, Sparkles, Zap, Building, Crown } from 'lucide-react';
import { Button } from '../components/Button';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for new trainers getting started',
    price: '19.99',
    period: 'month',
    clientLimit: 'Up to 5 clients',
    icon: Sparkles,
    features: [
      'Up to 5 active clients',
      'Unlimited training programs',
      'Online booking system',
      'Client mobile app access',
      'Progress tracking',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Growth',
    description: 'For growing trainers expanding their business',
    price: '28.99',
    period: 'month',
    clientLimit: 'Up to 15 clients',
    icon: Zap,
    features: ['Everything from Starter', 'Up to 15 active clients'],
    cta: 'Get Started',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro',
    description: 'For established trainers ready to scale',
    price: '38.99',
    period: 'month',
    clientLimit: 'Up to 30 clients',
    icon: Building,
    features: ['Everything from Growth', 'Up to 30 active clients'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Unlimited',
    description: 'For gyms and multi-trainer operations',
    price: '59.99',
    period: 'month',
    clientLimit: 'Unlimited clients',
    icon: Crown,
    features: ['Everything from Pro', 'Unlimited clients', 'Custom branding', 'Custom integrations', 'Dedicated support'],
    cta: 'Get Started',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-400/5 to-cyan-400/5 rounded-full blur-[200px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Simple, Transparent
            <span className="block bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">Pricing That Scales</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            All plans include the same powerful features. Choose based on how many clients you train.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-[2rem] p-6 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-amber-400/10 to-cyan-400/5 border-2 border-amber-400/30 scale-105 z-10'
                  : 'bg-[#111118] border border-[#27273a] hover:border-amber-400/20'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-xs font-semibold text-[#0a0a0f] shadow-lg shadow-amber-500/25">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    plan.highlighted ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-[#0a0a0f] border border-[#27273a]'
                  }`}
                >
                  <plan.icon className={`w-6 h-6 ${plan.highlighted ? 'text-[#0a0a0f]' : 'text-amber-400'}`} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{plan.description}</p>

                <div className="text-xs font-medium text-amber-400 mb-4">{plan.clientLimit}</div>

                <div>
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-slate-500 ml-1">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 text-sm font-semibold ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-[#0a0a0f] border-0 shadow-lg shadow-amber-500/25'
                    : 'bg-white/5 border border-[#27273a] text-white hover:bg-white/10 hover:border-amber-400/20'
                }`}
                asChild
              >
                <a href="/contact">{plan.cta}</a>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 mb-4">Trusted by trainers</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['No hidden fees', 'Cancel anytime', 'Secure payments'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                <Check className="w-4 h-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
