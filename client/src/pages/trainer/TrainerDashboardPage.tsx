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
    const confirm = window.confirm("Are you sure you want to cancel this session?");
    if (!confirm) return;
    try {
      const res = await trainerApi.cancelTerm(id);
      if (!res.success) { toast.error(res.message || "Error canceling session"); return; }
      await load();
      toast.success("Session canceled");
    } catch (e: any) { toast.error(e?.message || "Cancellation failed"); }
  };

  const openDetails = (id: number) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const start = toDate(weekStart, ev.day, ev.start);
    const end = toDate(weekStart, ev.day, ev.end);
    setDetails({ open: true, data: { id: ev.id, title: ev.title, startAt: start.toISOString(), endAt: end.toISOString(), type: ev.type, completed: ev.completed, } });
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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 opacity-0 animate-fade-in-up">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  TRAINER <span className="text-amber-400">DASHBOARD</span>
                </h1>
                <p className="text-slate-400 text-sm tracking-wide uppercase">
                  Manage your sessions
                </p>
              </div>

              <WeekSwitcher weekStart={weekStart} onChange={setWeekStart} />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">Loading...</p>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                  {[
                    {
                      label: "SESSIONS",
                      value: stats?.totalTerms ?? 0,
                      sub: "This week",
                      icon: Activity,
                      iconColor: "text-amber-400",
                      card: "stat-card-1",
                      stagger: "stagger-1",
                    },
                    {
                      label: "WORK HOURS",
                      value: Number(stats?.scheduledHours ?? 0).toFixed(1),
                      sub: "Total scheduled",
                      icon: Clock,
                      iconColor: "text-cyan-400",
                      card: "stat-card-2",
                      stagger: "stagger-2",
                    },
                    {
                      label: "CLIENTS",
                      value: stats?.enrolledThisWeek ?? 0,
                      sub: "Active participants",
                      icon: Users,
                      iconColor: "text-violet-400",
                      card: "stat-card-3",
                      stagger: "stagger-3",
                    },
                  ].map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={idx}
                        className={`${s.card} rounded-2xl p-6 card-hover opacity-0 animate-fade-in-up ${s.stagger}`}
                        style={{ animationFillMode: "forwards" }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-[#0a0a0f]/50 flex items-center justify-center ${s.iconColor}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                            <p className="text-4xl font-bold text-white">{s.value}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">{s.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Schedule */}
                  <div
                    className="lg:col-span-3 opacity-0 animate-fade-in-up stagger-4"
                    style={{ animationFillMode: "forwards" }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
                      <h2 className="text-xl font-bold text-white">WEEKLY SCHEDULE</h2>
                    </div>

                    <div className="bg-[#0a0a0f]">
                      <WeeklyCards
                        weekStart={weekStart}
                        items={events}
                        onCancel={cancelTerm}
                        onDetails={openDetails}
                        isTrainer={true}
                      />
                    </div>
                  </div>

                  {/* Pending ratings */}
                  <div
                    className="lg:col-span-2 opacity-0 animate-fade-in-up stagger-5"
                    style={{ animationFillMode: "forwards" }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full" />
                      <h2 className="text-xl font-bold text-white">TO RATE</h2>
                    </div>

                    <div className="space-y-4">
                      {pending.length === 0 ? (
                        <div className="bg-[#111118] rounded-xl p-8 border border-[#27273a] text-center">
                          <Star className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                          <p className="text-sm text-slate-400 uppercase tracking-wide font-semibold">
                            Nothing to rate
                          </p>
                        </div>
                      ) : (
                        pending.map((p) => (
                          <div
                            key={p.termId}
                            className="bg-[#111118] rounded-xl p-5 border border-[#27273a] card-hover"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-1">{p.programTitle}</h3>
                                <p className="text-sm text-slate-400">
                                  {format(new Date(p.startAt), "HH:mm")} • {p.count} participant{p.count !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                                <Star className="w-5 h-5 text-amber-400" />
                              </div>
                            </div>

                            <button
                              onClick={() => openRate(p.termId)}
                              className="w-full btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f] font-semibold rounded-xl py-4 transition-all active:scale-[0.99]"
                            >
                              RATE PARTICIPANTS
                            </button>
                          </div>
                        ))
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
