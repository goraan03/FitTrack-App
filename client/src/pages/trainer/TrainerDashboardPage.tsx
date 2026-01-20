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
      if (!res.success) { alert(res.message || "Failed to cancel"); return; }
      await load();
    } catch (e: any) { alert(e?.message || "Cancel failed"); }
  };

  const openDetails = (id: number) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const start = toDate(weekStart, ev.day, ev.start);
    const end = toDate(weekStart, ev.day, ev.end);
    setDetails({ open: true, data: { id: ev.id, title: ev.title, startAt: start.toISOString(), endAt: end.toISOString(), type: ev.type } });
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_200px_at_10%_0%,rgba(253,224,71,0.06),transparent),radial-gradient(500px_200px_at_90%_10%,rgba(253,224,71,0.04),transparent)]" />

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400">Overview of your scheduled sessions</p>
        </div>
        <WeekSwitcher weekStart={weekStart} onChange={setWeekStart} />
      </div>

      {loading ? (
        <div className="relative text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-5 text-black">
              <div className="text-sm text-gray-600">This week</div>
              <div className="text-3xl font-bold text-yellow-500 mt-1">{stats?.totalTerms ?? 0}</div>
              <div className="text-xs text-gray-500">Scheduled sessions</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-5 text-black">
              <div className="text-sm text-gray-600">Scheduled hours</div>
              <div className="text-3xl font-bold text-yellow-500 mt-1">{(stats?.scheduledHours ?? 0).toFixed(1)}</div>
              <div className="text-xs text-gray-500">This week</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-5 text-black">
              <div className="text-sm text-gray-600">Participants</div>
              <div className="text-3xl font-bold text-yellow-500 mt-1">{stats?.enrolledThisWeek ?? 0}</div>
              <div className="text-xs text-gray-500">This week</div>
            </div>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-5 text-black">
              <div className="text-sm text-gray-700 mb-3">
                This Week&apos;s Schedule · {format(weekStart, "MMM d")} – {format(new Date(weekStart.getTime()+6*86400000), "MMM d")}
              </div>
              <WeeklyCards weekStart={weekStart} items={events} onCancel={cancelTerm} onDetails={openDetails} />
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-5 text-black">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Pending ratings</h3>
                <span className="text-sm text-gray-500">{pending.length} terms</span>
              </div>
              <div className="mt-3 divide-y divide-gray-100">
                {pending.length === 0 ? (
                  <div className="text-gray-500 text-sm py-4">No sessions to rate.</div>
                ) : pending.map(p => (
                  <div key={p.termId} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{p.programTitle}</div>
                      <div className="text-xs text-gray-500">{new Date(p.startAt).toLocaleString()} • {p.count} participant(s)</div>
                    </div>
                    <button
                      onClick={() => openRate(p.termId)}
                      className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-400/90 text-black text-sm shadow-sm"
                    >
                      Rate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

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