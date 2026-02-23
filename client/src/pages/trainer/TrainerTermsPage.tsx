import { useEffect, useState } from "react";
import type { TrainerTerm } from "../../types/trainer/Term";
import { format } from "date-fns";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import { Calendar, Clock, Users, Plus, Trash2, Activity, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function TrainerTermsPage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const [terms, setTerms] = useState<TrainerTerm[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ 
    type: 'individual' as 'individual'|'group', 
    startDate: '', 
    startTime: '', 
    durationMin: 60, 
    capacity: 1 
  });

  const load = async () => {
    setLoading(true);
    try {
      const t = await trainerApi.listTerms();
      if (t.success) setTerms(t.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { 
    if (form.type === 'individual') setForm(f => ({ ...f, capacity: 1 })); 
  }, [form.type]);

  const save = async () => {
    if (!form.startDate || !form.startTime) return toast.error('Pick date and time');
    const startAtISO = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
    const r = await trainerApi.createTerm({
      type: form.type,
      startAtISO,
      durationMin: form.durationMin,
      capacity: form.capacity
    });
    if (!r.success) return toast.error(r.message);
    toast.success('Session slot created! Clients can now book it.');
    await load();
  };

  const cancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this term?')) return;
    const r = await trainerApi.cancelTerm(id);
    if (!r.success) return toast.error(r.message);
    toast.success('Term canceled');
    await load();
  };

  return (
  <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
    <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-12">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 sm:mb-10 opacity-0 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#111118] border border-[#27273a] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              TRAINING <span className="text-amber-400">SCHEDULE</span>
            </h1>
            <p className="text-slate-400 text-sm tracking-wide uppercase">
              Manage your sessions and bookings
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: CREATE FORM */}
        <div
          className="lg:col-span-5 space-y-5 opacity-0 animate-fade-in-up stagger-1"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-3 px-1">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">CREATE NEW SESSION</h2>
          </div>

          <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] space-y-5">
            {/* Program */}
            

            {/* Type + Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                  Type
                </label>

                <div className="flex bg-[#0a0a0f] p-1 rounded-xl border border-[#27273a]">
                  <button
                    onClick={() => setForm((f) => ({ ...f, type: "individual" }))}
                    className={`
                      flex-1 py-2.5 px-2 text-[11px] font-semibold uppercase rounded-lg transition-all
                      ${form.type === "individual"
                        ? "bg-amber-400/15 text-amber-300 border border-amber-400/25"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}
                    `}
                  >
                    Individual
                  </button>

                  <button
                    onClick={() => setForm((f) => ({ ...f, type: "group" }))}
                    className={`
                      flex-1 py-2.5 px-2 text-[11px] font-semibold uppercase rounded-lg transition-all
                      ${form.type === "group"
                        ? "bg-amber-400/15 text-amber-300 border border-amber-400/25"
                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}
                    `}
                  >
                    Group
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                  Capacity
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    disabled={form.type === "individual"}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                    className="
                      w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl
                      py-3 pl-11 pr-4 text-sm text-white
                      focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                      disabled:opacity-30
                    "
                  />
                </div>
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="
                    w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl
                    px-4 py-3 text-sm text-white
                    focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                  "
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                  Time
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="
                    w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl
                    px-4 py-3 text-sm text-white
                    focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                  "
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Duration (minutes)
              </label>
              <input
                type="number"
                value={form.durationMin}
                onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))}
                className="
                  w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl
                  px-4 py-3 text-sm text-white
                  focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                "
              />
            </div>

            {/* CTA */}
            <button
              onClick={save}
              className="
                w-full py-3.5 rounded-xl
                btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600
                text-[#0a0a0f] font-semibold
                transition-all active:scale-[0.99]
                flex items-center justify-center gap-2
              "
            >
              <Plus className="w-4 h-4" /> CREATE SESSION
            </button>

            {/* Tip */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/5">
              <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Individual sessions automatically have capacity set to 1.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: UPCOMING LIST */}
        <div
          className="lg:col-span-7 space-y-5 opacity-0 animate-fade-in-up stagger-2"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full" />
              <h2 className="text-xl font-bold text-white">UPCOMING SESSIONS</h2>
            </div>
            <Activity className="w-5 h-5 text-slate-500" />
          </div>

          <div className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] overflow-hidden">
            {loading ? (
              <div className="p-16 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400/20 border-t-amber-400" />
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {terms.length === 0 ? (
                  <div className="p-16 text-center opacity-80">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                      No sessions scheduled
                    </p>
                  </div>
                ) : (
                  terms.map((t) => (
                    <div
                      key={t.id}
                      className={`
                        p-5 sm:p-6 flex items-center justify-between gap-4 group transition-colors
                        hover:bg-white/[0.03]
                        ${t.canceled ? "opacity-50" : ""}
                      `}
                    >
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                        {/* Date badge */}
                        <div
                          className={`
                            w-14 h-14 rounded-2xl flex flex-col items-center justify-center border
                            ${t.canceled
                              ? "border-slate-600/40 bg-slate-600/10 text-slate-400"
                              : "border-amber-400/20 bg-amber-400/5 text-amber-300"}
                          `}
                        >
                          <span className="text-[10px] font-semibold uppercase">
                            {format(new Date(t.startAt), "MMM")}
                          </span>
                          <span className="text-xl font-bold leading-none">
                            {format(new Date(t.startAt), "dd")}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm sm:text-base text-white truncate group-hover:text-amber-300 transition-colors">
                              {t.programTitle || <span className="italic text-slate-400 text-sm">No program yet</span>}
                            </h4>

                            {t.canceled && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg">
                                <AlertCircle className="w-3 h-3" />
                                Canceled
                              </span>
                            )}
                          </div>
                          {t.enrolledClientName && (
                            <div className="mt-0.5 text-xs text-cyan-400 font-medium">
                              Client: {t.enrolledClientName}
                            </div>
                          )}
                          {!t.enrolledClientId && (
                            <div className="mt-0.5 text-xs text-slate-500 italic">
                              Awaiting booking
                            </div>
                          )}

                          <div className="mt-1 flex items-center gap-3 text-slate-400 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-tight">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(t.startAt), "HH:mm")} ({t.durationMin} min)
                            </span>

                            <span className="w-1 h-1 bg-slate-700 rounded-full" />

                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-tight">
                              <Users className="w-3.5 h-3.5" />
                              {t.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cancel button */}
                      {!t.canceled && (
                        <button
                          onClick={() => cancel(t.id)}
                          className="
                            w-11 h-11 rounded-xl
                            bg-rose-500/10 border border-rose-500/20
                            text-rose-300 hover:bg-rose-500 hover:text-white
                            transition-all
                            opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                            flex items-center justify-center
                          "
                          title="Cancel session"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <style>{`
      input[type="date"]::-webkit-calendar-picker-indicator,
      input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        opacity: 0.55;
        cursor: pointer;
      }
    `}</style>
  </div>
);}