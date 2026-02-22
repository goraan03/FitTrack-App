import { useState } from "react";
import { Mail, Send, ShieldCheck, UserPlus, Activity } from "lucide-react";
import axios, { isAxiosError } from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "") + "public";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSent(false);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post<{ success: boolean; message: string }>(
        `${API_URL}/contact`,
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError(res.data.message || "An error occurred while sending the message.");
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "An error occurred while sending the message.");
      } else {
        setError("An error occurred while sending the message.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6">
      
      {/* HEADER SECTION */}
      <div className="relative p-10 sm:p-16 rounded-[2.5rem] border border-[#27273a] bg-[#111118] overflow-hidden shadow-2xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-400/5 blur-[100px] rounded-full" />

        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 mb-6">
            <UserPlus className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/80">
              Inquiry & Trainer Access
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white leading-tight uppercase italic">
            GET IN <span className="text-amber-400">TOUCH</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
            Have a question, feedback, or want to request a <strong>Trainer Account</strong>? 
            Fill out the form below to contact the administrator and we'll get back to you shortly.
          </p>

          <div className="mt-8 flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#0a0a0f] border border-[#27273a] text-sm">
            <Mail className="h-4 w-4 text-amber-400" />
            <a href="mailto:fittrackappsupp@gmail.com" className="font-bold text-slate-300 hover:text-amber-400 transition-colors uppercase tracking-tight">
              fittrackappsupp@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Info Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3 mb-2 ml-2">
            <div className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white italic">Information</h2>
          </div>
          
          <InfoCard 
            title="Trainer Onboarding" 
            desc="Official trainer accounts are manually created by admins to ensure quality."
            icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
            borderColor="border-amber-400/20"
          />
          <InfoCard 
            title="Customization" 
            desc="Want to adapt FitTrack to your specific gym or studio needs?"
            icon={<Activity className="w-5 h-5 text-cyan-400" />}
            borderColor="border-cyan-400/20"
          />
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-8">
          <div className="bg-[#111118] p-8 sm:p-10 rounded-[2.5rem] border border-[#27273a] shadow-2xl">
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                  <input
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-[#27273a] bg-[#0a0a0f] px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-400/50 transition-all placeholder:text-slate-700"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Your Message</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0f] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : (
                  <>
                    Send Message
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Restilizovane Info kartice
function InfoCard({ title, desc, icon, borderColor }: { title: string; desc: string; icon: React.ReactNode; borderColor: string }) {
  return (
    <div className={`p-6 rounded-2xl bg-[#111118] border border-[#27273a] ${borderColor} border-opacity-30 shadow-xl group hover:border-opacity-100 transition-all`}>
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#27273a] flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed font-semibold uppercase italic opacity-70">{desc}</p>
    </div>
  );
}