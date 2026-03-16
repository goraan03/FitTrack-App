import { useState, type ReactNode } from 'react';
import { Mail, Send, ShieldCheck, Activity, UserPlus } from 'lucide-react';
import axios, { isAxiosError } from 'axios';
import { Button } from '../components/Button';

const API_URL = (import.meta.env.VITE_API_URL || '') + 'public';
const CONTACT_EMAIL = 'trainmetersupport@gmail.com';

export function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post<{ success: boolean; message?: string }>(`${API_URL}/contact`, form, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.data.success) {
        setSent(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        setError(res.data.message || 'An error occurred while sending the message.');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'An error occurred while sending the message.');
      } else {
        setError('An error occurred while sending the message.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-2 mb-6">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">Inquiry &amp; Trainer Access</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 text-balance">
            Get In <span className="bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent"> Touch</span>
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 text-pretty">
            Have a question, feedback, or want to request a Trainer Account? Fill out the form below and we&apos;ll get back to you shortly.
          </p>
          <div className="mt-4 max-w-2xl mx-auto text-sm text-amber-200 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
            Trainers: please include your first name, last name, email, and a social profile link (Instagram/LinkedIn) to verify you are a trainer when requesting an account.
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[#111118] border border-[#27273a] text-sm w-fit mx-auto">
            <Mail className="h-4 w-4 text-amber-400" />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-bold text-slate-300 hover:text-amber-400 transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3 mb-2 ml-2">
              <div className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Information</h3>
            </div>

            <InfoCard
              title="Trainer Onboarding"
              desc="Official trainer accounts are manually created by admins to ensure quality."
              icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
              borderColor="border-amber-400/20"
            />
            <InfoCard
              title="Customization"
              desc="Want to adapt TrainMeter to your specific gym or studio needs?"
              icon={<Activity className="w-5 h-5 text-cyan-400" />}
              borderColor="border-cyan-400/20"
            />
          </div>

          <div className="lg:col-span-8">
            <div className="bg-[#111118] p-8 sm:p-10 rounded-[2.5rem] border border-[#27273a] shadow-2xl">
              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <input
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-[#27273a] bg-[#0a0a0f] px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-400/50 transition-all placeholder:text-slate-700"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                    <input
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-[#27273a] bg-[#0a0a0f] px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-400/50 transition-all placeholder:text-slate-700"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Your Message</label>
                  <textarea
                    placeholder="Tell us about your request or gym studio..."
                    className="w-full rounded-xl border border-[#27273a] bg-[#0a0a0f] px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-400/50 transition-all min-h-[150px] resize-none placeholder:text-slate-700"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {error && (
                  <div className="text-[10px] font-bold text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 uppercase tracking-widest">
                    {error}
                  </div>
                )}
                {sent && (
                  <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 uppercase tracking-widest">
                    Your message has been sent. Thank you!
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto h-14 px-10 bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0f] font-semibold shadow-lg shadow-amber-500/10 hover:from-amber-500 hover:to-amber-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : (
                    <>
                      Send Message
                      <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, desc, icon, borderColor }: { title: string; desc: string; icon: ReactNode; borderColor: string }) {
  return (
    <div className={`p-6 rounded-2xl bg-[#111118] border border-[#27273a] ${borderColor} border-opacity-30 shadow-xl group hover:border-opacity-100 transition-all`}>
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#27273a] flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h4 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h4>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
