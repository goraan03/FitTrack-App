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
import toast from "react-hot-toast";

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
          completed: e.completed,
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
      if (!res.success) { toast.error(res.message || "Error canceling"); return; }
      await load();
      toast.success("Session canceled");
    } catch (e: any) { toast.error(e?.message || "Cancelation failed"); }
  };

  const openDetails = (id: number) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const start = toDate(weekStart, ev.day, ev.start);
    const end = toDate(weekStart, ev.day, ev.end);
    setDetails({ open: true, data: { id: ev.id, title: ev.title, startAt: start.toISOString(), endAt: end.toISOString(), type: ev.type } });
  };

  const handleDeleteTerm = async (id: number) => {
    const res = await trainerApi.deleteTerm(id);
    if (res.success) {
      setDetails({ open: false });
      load();
      toast.success("Session deleted");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background Gradient */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-yellow-500/5 via-yellow-500/0 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-br from-[#1a1a1a] to-[#161616] p-6 rounded-2xl border border-white/5 shadow-2xl">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
              TRAINER <span className="text-yellow-400">DASHBOARD</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1.5 uppercase tracking-wider font-medium">
              Manage your sessions
            </p>
          </div>
          <WeekSwitcher weekStart={weekStart} onChange={setWeekStart} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            <p className="text-gray-500 animate-pulse uppercase tracking-wide text-sm font-semibold">Loading...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: "SESSIONS", 
                  value: stats?.totalTerms, 
                  icon: <Activity className="w-7 h-7 text-yellow-400" />, 
                  sub: "This week",
                  gradient: "from-yellow-500/10 to-yellow-600/5"
                },
                { 
                  label: "HOURS", 
                  value: stats?.scheduledHours?.toFixed(1), 
                  icon: <Clock className="w-7 h-7 text-blue-400" />, 
                  sub: "Total scheduled",
                  gradient: "from-blue-500/10 to-blue-600/5"
                },
                { 
                  label: "CLIENTS", 
                  value: stats?.enrolledThisWeek, 
                  icon: <Users className="w-7 h-7 text-green-400" />, 
                  sub: "Active participants",
                  gradient: "from-green-500/10 to-green-600/5"
                }
              ].map((s, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-gradient-to-br from-[#1d1d1d] to-[#161616] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative flex items-start justify-between">
                    <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs font-black uppercase tracking-wider">{s.label}</p>
                      <h3 className="text-4xl font-black text-white mt-1">{s.value ?? 0}</h3>
                    </div>
                  </div>
                  
                  <div className="relative mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 uppercase font-bold tracking-widest">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Schedule */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-yellow-400 rounded-full" />
                  <h2 className="text-xl font-black uppercase tracking-tight">WEEKLY SCHEDULE</h2>
                </div>
                
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#161616] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                  <WeeklyCards 
                    weekStart={weekStart} 
                    items={events} 
                    onCancel={cancelTerm} 
                    onDetails={openDetails}
                    isTrainer={true}
                  />
                </div>
              </div>

              {/* Pending Ratings Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-blue-400 rounded-full" />
                  <h2 className="text-xl font-black uppercase tracking-tight">TO RATE</h2>
                </div>
                
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#161616] rounded-2xl border border-white/5 p-6 shadow-2xl">
                  {pending.length === 0 ? (
                    <div className="text-center py-12 opacity-30">
                      <Star className="w-14 h-14 mx-auto mb-4 text-gray-600" />
                      <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">No sessions to rate</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pending.map(p => (
                        <div 
                          key={p.termId} 
                          className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-yellow-400/30 transition-all"
                        >
                          <div className="font-bold text-white leading-tight mb-1 group-hover:text-yellow-400 transition-colors">
                            {p.programTitle}
                          </div>
                          <div className="text-xs text-gray-500 mb-4 uppercase tracking-wide">
                            {format(new Date(p.startAt), "HH:mm")} • {p.count} participant{p.count > 1 ? 's' : ''}
                          </div>
                          <button
                            onClick={() => openRate(p.termId)}
                            className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
                          >
                            Rate Participants
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
        onClose={() => setRateModal({ open: false, participants: [] })}
        onSubmit={submitRatings}
      />

      <TermDetailsModal 
        open={details.open} 
        onClose={() => setDetails({ open: false })} 
        data={details.data}
        isTrainer={true}
        onDelete={handleDeleteTerm}
      />
    </div>
  );
}