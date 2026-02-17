import { useEffect, useMemo, useState } from "react";
import { startOfWeek, format } from "date-fns";
import WeekSwitcher from "../../components/client/WeekSwitcher";
import WeeklyCards from "../../components/client/WeeklyCards";
import type { WeeklyCardItem } from "../../models/client/WeeklyCardItem";
import RateTermModal from "../../components/trainer/RateTermModal";
import TermDetailsModal from "../../components/client/TermDetailsModal";
import type { TermDetails } from "../../models/client/TermDetails";
import { toDate } from "../../helpers/client/toDate";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import { Activity, Clock, Users, Star } from "lucide-react";

interface TrainerDashboardPageProps { trainerApi: ITrainerAPIService; }

export default function TrainerDashboardPage({ trainerApi }: TrainerDashboardPageProps) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalTerms: number; scheduledHours: number; avgRating: number | null; enrolledThisWeek: number } | null>(null);
  const [events, setEvents] = useState<WeeklyCardItem[]>([]);
  const [pending, setPending] = useState<{ termId: number; startAt: string; programTitle: string; count: number }[]>([]);
  const [rateModal, setRateModal] = useState<{ open: boolean; termId?: number; programTitle?: string; participants: { userId: number; userName: string }[] }>({ open: false, participants: [] });
  const [details, setDetails] = useState<{ open: boolean; data?: TermDetails }>({ open: false });

  const weekStartISO = useMemo(() => {
    const d = new Date(weekStart);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [weekStart]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await trainerApi.getDashboard(weekStartISO);
      if (res.success) {
        setStats(res.data.stats);
        setPending(res.data.pendingRatings);
        const items: WeeklyCardItem[] = res.data.events.map(e => ({
          id: e.id,
          title: e.title,
          day: e.day,
          start: e.start,
          end: e.end,
          type: String(e.type).toLowerCase() === "individual" ? "individual" : "group",
          trainerName: "",
          cancellable: e.cancellable,
          programId: e.programId,
        }));
        setEvents(items);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [weekStartISO]);

  const openRate = async (termId: number) => {
    const r = await trainerApi.getUnrated(termId);
    if (r.success) setRateModal({ open: true, termId, programTitle: r.data.programTitle, participants: r.data.participants });
  };

  const submitRatings = async (ratings: { userId: number; rating: number }[]) => {
    const termId = rateModal.termId!;
    for (const r of ratings) await trainerApi.rateParticipant(termId, r.userId, r.rating);
    await load();
  };

  const cancelTerm = async (id: number) => {
    try {
      const res = await trainerApi.cancelTerm(id);
      if (!res.success) { alert(res.message || "Greška pri otkazivanju"); return; }
      await load();
    } catch (e: any) { alert(e?.message || "Otkazivanje nije uspjelo"); }
  };

  const openDetails = (id: number) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const start = toDate(weekStart, ev.day, ev.start);
    const end = toDate(weekStart, ev.day, ev.end);
    setDetails({ open: true, data: { id: ev.id, title: ev.title, startAt: start.toISOString(), endAt: end.toISOString(), type: ev.type } });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 pb-12 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161616] p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              Trainer <span className="text-yellow-400">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-medium">Upravljajte svojim terminima</p>
          </div>
          <WeekSwitcher weekStart={weekStart} onChange={setWeekStart} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse">Učitavanje podataka...</p>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Termini", value: stats?.totalTerms, icon: <Activity className="w-6 h-6 text-yellow-400" />, sub: "Ove sedmice" },
                { label: "Sati rada", value: stats?.scheduledHours?.toFixed(1), icon: <Clock className="w-6 h-6 text-blue-400" />, sub: "Ukupno vrijeme" },
                { label: "Klijenti", value: stats?.enrolledThisWeek, icon: <Users className="w-6 h-6 text-green-400" />, sub: "Aktivni polaznici" }
              ].map((s, idx) => (
                <div key={idx} className="bg-[#161616] border border-white/5 p-6 rounded-3xl hover:border-white/20 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{s.icon}</div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
                      <h3 className="text-3xl font-black text-white mt-1">{s.value ?? 0}</h3>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 uppercase font-bold tracking-widest">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Schedule */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-yellow-400 rounded-full"></div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Sedmični raspored</h2>
                </div>
                <div className="bg-[#161616] rounded-3xl border border-white/5 p-2 shadow-xl">
                  <WeeklyCards weekStart={weekStart} items={events} onCancel={cancelTerm} onDetails={openDetails} />
                </div>
              </div>

              {/* Pending Ratings Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-blue-400 rounded-full"></div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Za ocjenjivanje</h2>
                </div>
                <div className="bg-[#161616] rounded-3xl border border-white/5 p-6 shadow-xl">
                  {pending.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                      <Star className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-sm">Nema sesija za ocjenjivanje.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pending.map(p => (
                        <div key={p.termId} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                          <div className="font-bold text-white leading-tight mb-1">{p.programTitle}</div>
                          <div className="text-xs text-gray-500 mb-4">{format(new Date(p.startAt), "HH:mm")} • {p.count} polaznika</div>
                          <button
                            onClick={() => openRate(p.termId)}
                            className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-yellow-400/10"
                          >
                            Ocijeni polaznike
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <RateTermModal
        open={rateModal.open}
        programTitle={rateModal.programTitle}
        participants={rateModal.participants}
        onClose={()=> setRateModal({ open: false, participants: [] })}
        onSubmit={submitRatings}
      />

      <TermDetailsModal open={details.open} onClose={() => setDetails({ open: false })} data={details.data} />
    </div>
  );
}