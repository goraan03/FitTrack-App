import { useState } from 'react';
import { HelpCircle, Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'How do I get started as a trainer?',
    answer:
      'Trainers request an account by contacting our admin team through the contact form. We manually verify and create official trainer accounts to ensure quality and trust on the platform. Clients can self-register and request to join their trainer.',
  },
  {
    question: 'Can my clients access their programs on mobile?',
    answer:
      "Absolutely! Your clients get access to a mobile-responsive portal where they can view their programs, book sessions, track progress, and stay connected—all from their phone.",
  },
  {
    question: 'Is my data secure?',
    answer: "Yes. We use bank-level encryption, secure cloud infrastructure, and follow GDPR compliance. Your data and your clients' data are fully protected.",
  },
  {
    question: 'Can I customize the branding?',
    answer: 'Pro and Unlimited plans include custom branding options. Add your logo and colors to create a fully branded experience for your clients.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'All plans include email support. Higher tier plans get priority support with faster response times. Unlimited plans include a dedicated account manager.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes, there are no long-term contracts. You can cancel your subscription at any time, and you'll retain access until the end of your billing period.",
  },
  {
    question: 'How do clients register and join my training?',
    answer:
      'Clients can self-register on the platform and then send a request to join your training roster. You review and approve client requests from your dashboard.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">FAQ</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Frequently Asked
            <span className="block bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">Questions</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            Everything you need to know about TrainoraX. Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
        </div>

        <div className="space-y-4" role="list" aria-label="Frequently asked questions">
          {faqs.map((faq, index) => (
            <article
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                openIndex === index ? 'bg-[#111118] border-amber-400/20' : 'bg-[#111118] border-[#27273a] hover:border-amber-400/10'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-medium text-white pr-4">{faq.question}</span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openIndex === index ? 'bg-amber-400/20 text-amber-400' : 'bg-[#27273a] text-slate-400'
                  }`}
                  aria-hidden="true"
                >
                  {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              {openIndex === index && (
                <div id={`faq-answer-${index}`} className="px-6 pb-6">
                  <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
