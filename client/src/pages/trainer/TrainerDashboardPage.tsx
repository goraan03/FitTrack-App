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
import { Activity, Clock, Users, Star, UserCheck, XCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsContext";
import type { PendingRequest } from "../../types/trainer/Billing";

interface TrainerDashboardPageProps { trainerApi: ITrainerAPIService; }

export default function TrainerDashboardPage({ trainerApi }: TrainerDashboardPageProps) {
  const { t } = useSettings();
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalTerms: number; scheduledHours: number; avgRating: number | null; enrolledThisWeek: number } | null>(null);
  const [events, setEvents] = useState<WeeklyCardItem[]>([]);
  const [pending, setPending] = useState<{ termId: number; startAt: string; programTitle: string; count: number }[]>([]);
  const [rateModal, setRateModal] = useState<{ open: boolean; termId?: number; programTitle?: string; participants: { userId: number; userName: string }[] }>({ open: false, participants: [] });
  const [details, setDetails] = useState<{ open: boolean; data?: TermDetails }>({ open: false });
  const [reqModal, setReqModal] = useState<{ open: boolean; loading: boolean; items: PendingRequest[]; actionId: number | null }>({ open: false, loading: false, items: [], actionId: null });
  const [reqCount, setReqCount] = useState(0);

  const weekStartISO = useMemo(() => {
    const d = new Date(weekStart);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [weekStart]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await trainerApi.getDashboard(weekStartISO);
      const reqs = await trainerApi.listPendingRequests();
      if (res.success) {
        setStats(res.data.stats);
        setPending(res.data.pendingRatings);
        const now = Date.now();
        const items: WeeklyCardItem[] = res.data.events
          .map(e => {
            const normalizedType: "individual" | "group" =
              String(e.type).toLowerCase() === "individual" ? "individual" : "group";

            const startDate = e.startAt ? new Date(e.startAt) : toDate(weekStart, e.day, e.start);
            const endDate = e.durationMin
              ? new Date(startDate.getTime() + e.durationMin * 60000)
              : toDate(weekStart, e.day, e.end);
            const startStr = format(startDate, "HH:mm");
            const endStr = format(endDate, "HH:mm");

            return {
              id: e.id,
              title: e.title,
              day: e.day,
              start: startStr,
              end: endStr,
              type: normalizedType,
              trainerName: "",
              cancellable: e.cancellable,
              programId: e.programId,
              completed: e.completed,
              enrolledClientId: e.enrolledClientId,
              enrolledClientName: e.enrolledClientName,
            };
          })
          .filter(ev => {
            const endDate = toDate(weekStart, ev.day, ev.end);
            return endDate.getTime() > now;
          });
        setEvents(items);
      }
      if (reqs.success) setReqCount(reqs.data.length);
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
    setDetails({
      open: true,
      data: {
        id: ev.id,
        title: ev.title,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        type: ev.type,
        completed: ev.completed,
        enrolledClientId: ev.enrolledClientId,
        enrolledClientName: ev.enrolledClientName,
        programId: ev.programId,
      }
    });
  };

  const handleDeleteTerm = async (id: number) => {
    const res = await trainerApi.deleteTerm(id);
    if (res.success) {
      setDetails({ open: false });
      load();
      toast.success("Session deleted");
    }
  };

  const openRequests = async () => {
    setReqModal(m => ({ ...m, open: true, loading: true }));
    try {
      const res = await trainerApi.listPendingRequests();
      if (res.success) {
        setReqModal({ open: true, loading: false, items: res.data, actionId: null });
        setReqCount(res.data.length);
      } else {
        toast.error("Greška pri učitavanju zahtjeva");
        setReqModal(m => ({ ...m, loading: false }));
      }
    } catch (e: any) {
      toast.error(e?.message || "Greška pri učitavanju zahtjeva");
      setReqModal(m => ({ ...m, loading: false }));
    }
  };

  const approveReq = async (id: number) => {
    setReqModal(m => ({ ...m, actionId: id }));
    try {
      const res = await trainerApi.approveRequest(id);
      if (res.success) {
        toast.success("Klijent odobren");
        await openRequests();
      } else {
        toast.error(res.message || "Greška");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Greška";
      if (msg.startsWith("PLAN_LIMIT_REACHED")) toast.error("Dostignut limit paketa — uradi upgrade");
      else toast.error(msg);
    } finally {
      setReqModal(m => ({ ...m, actionId: null }));
    }
  };

  const rejectReq = async (id: number) => {
    setReqModal(m => ({ ...m, actionId: id }));
    try {
      const res = await trainerApi.rejectRequest(id);
      if (res.success) {
        toast.success("Zahtjev odbijen");
        await openRequests();
      } else {
        toast.error(res.message || "Greška");
      }
    } catch {
      toast.error("Greška");
    } finally {
      setReqModal(m => ({ ...m, actionId: null }));
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
              {t('trainer_dashboard').split(' ')[0].toUpperCase()} <span className="text-amber-400">{t('trainer_dashboard').split(' ').slice(1).join(' ').toUpperCase()}</span>
            </h1>
            <p className="text-slate-400 text-sm tracking-wide uppercase">
              {t('manage_sessions')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={openRequests}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-sm font-semibold transition-all"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              {t('pending_requests') || 'Zahtevi'}
              <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold">
                {reqCount}
              </span>
            </button>
            <WeekSwitcher weekStart={weekStart} onChange={setWeekStart} />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">{t('loading')}...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {[
                {
                  label: t('sessions').toUpperCase(),
                  value: stats?.totalTerms ?? 0,
                  sub: t('this_week'),
                  icon: Activity,
                  iconColor: "text-amber-400",
                  card: "stat-card-1",
                  stagger: "stagger-1",
                },
                {
                  label: t('work_hours').toUpperCase(),
                  value: Number(stats?.scheduledHours ?? 0).toFixed(1),
                  sub: t('total_scheduled'),
                  icon: Clock,
                  iconColor: "text-cyan-400",
                  card: "stat-card-2",
                  stagger: "stagger-2",
                },
                {
                  label: t('clients').toUpperCase(),
                  value: stats?.enrolledThisWeek ?? 0,
                  sub: t('active_participants'),
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
                  <h2 className="text-xl font-bold text-white">{t('weekly_schedule').toUpperCase()}</h2>
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
                  <h2 className="text-xl font-bold text-white">{t('to_rate').toUpperCase()}</h2>
                </div>

                <div className="space-y-4">
                  {pending.length === 0 ? (
                    <div className="bg-[#111118] rounded-xl p-8 border border-[#27273a] text-center">
                      <Star className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-sm text-slate-400 uppercase tracking-wide font-semibold">
                        {t('nothing_to_rate')}
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
                          {t('rate_participants').toUpperCase()}
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

      {/* CLIENT REQUESTS MODAL */}
      {reqModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setReqModal(m => ({ ...m, open: false }))} />
          <div className="relative w-full max-w-2xl bg-[#0a0a0f] border border-[#27273a] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  {t('pending_requests') || 'Zahtevi klijenata'}
                </h3>
              </div>
              <button
                className="text-slate-400 hover:text-white text-sm"
                onClick={() => setReqModal(m => ({ ...m, open: false }))}
              >
                {t('close') || 'Zatvori'}
              </button>
            </div>

            {reqModal.loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : reqModal.items.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                {t('no_pending_requests') || 'Nema novih zahteva.'}
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {reqModal.items.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#111118] border border-[#27273a]"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                      {req.clientName[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{req.clientName}</p>
                      <p className="text-slate-400 text-sm break-all">{req.clientEmail}</p>
                      <p className="text-slate-600 text-xs mt-1 uppercase tracking-wider">
                        {new Date(req.createdAt).toLocaleDateString('sr-RS')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        disabled={reqModal.actionId === req.id}
                        onClick={() => rejectReq(req.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-400/5 hover:bg-red-400/10 border border-red-400/15 text-red-400 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('reject') || 'Odbij'}
                      </button>
                      <button
                        disabled={reqModal.actionId === req.id}
                        onClick={() => approveReq(req.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f] text-xs font-bold uppercase tracking-wider transition-all btn-glow disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('approve') || 'Odobri'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
        trainerApi={trainerApi}
        onProgramSet={load}
      />
    </div>
  );
}
