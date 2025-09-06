import { useEffect, useMemo, useState } from "react";
import { startOfWeek, format } from "date-fns";
import WeekSwitcher from "../../components/client/WeekSwitcher";
import WeeklyCards from "../../components/client/WeeklyCards";
import { trainerApi } from "../../api_services/trainer/TrainerAPIService";
import type { WeeklyCardItem } from "../../models/client/WeeklyCardItem";
import RateTermModal from "../../components/trainer/RateTermModal";

export default function TrainerDashboardPage() {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalTerms: number; scheduledHours: number; avgRating: number | null; enrolledThisWeek: number } | null>(null);
  const [events, setEvents] = useState<WeeklyCardItem[]>([]);
  const [pending, setPending] = useState<{ termId: number; startAt: string; programTitle: string; count: number }[]>([]);
  const [rateModal, setRateModal] = useState<{ open: boolean; termId?: number; programTitle?: string; participants: { userId: number; userName: string }[] }>({ open: false, participants: [] });

  const weekStartISO = useMemo(() => {
    const d = new Date(weekStart);
    d.setHours(0,0,0,0);
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
          type: e.type === "INDIVIDUAL" ? "individual" : e.type === "GROUP" ? "group" : e.type,
          trainerName: "",
          cancellable: e.cancellable,
        }));
        setEvents(items);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [weekStartISO]);

  const openRate = async (termId: number) => {
    const r = await trainerApi.getUnrated(termId);
    if (r.success) {
      setRateModal({ open: true, termId, programTitle: r.data.programTitle, participants: r.data.participants });
    }
  };

  const submitRatings = async (ratings: { userId: number; rating: number }[]) => {
    // simple loop (može i Promise.all)
    const termId = rateModal.termId!;
    for (const r of ratings) {
      await trainerApi.rateParticipant(termId, r.userId, r.rating);
    }
    await load(); // refresh dashboard
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
          <p className="text-gray-600">Overview of your scheduled sessions</p>
        </div>
        <WeekSwitcher weekStart={weekStart} onChange={setWeekStart} />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
              <div className="text-sm text-gray-500">This week</div>
              <div className="text-3xl font-bold text-emerald-700 mt-1">{stats?.totalTerms ?? 0}</div>
              <div className="text-xs text-gray-500">Scheduled sessions</div>
            </div>
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
              <div className="text-sm text-gray-500">Avg rating</div>
              <div className="text-3xl font-bold text-emerald-700 mt-1">{stats?.avgRating != null ? stats!.avgRating.toFixed(1) : "N/A"}</div>
              <div className="text-xs text-gray-500">Out of 10</div>
            </div>
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
              <div className="text-sm text-gray-500">Scheduled hours</div>
              <div className="text-3xl font-bold text-emerald-700 mt-1">{(stats?.scheduledHours ?? 0).toFixed(1)}</div>
              <div className="text-xs text-gray-500">This week</div>
            </div>
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
              <div className="text-sm text-gray-500">Enrolled</div>
              <div className="text-3xl font-bold text-emerald-700 mt-1">{stats?.enrolledThisWeek ?? 0}</div>
              <div className="text-xs text-gray-500">Participants this week</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly schedule */}
            <div className="bg-transparent">
              <div className="text-sm text-gray-700 mb-2">
                This Week's Schedule · {format(weekStart, "MMM d")} – {format(new Date(weekStart.getTime()+6*86400000), "MMM d")}
              </div>
              <WeeklyCards
                weekStart={weekStart}
                items={events}
                onCancel={(id) => { /* kasnije: cancel term */ }}
                onDetails={(id) => { /* kasnije: open details */ }}
              />
            </div>

            {/* Pending ratings */}
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Pending ratings</h3>
                <span className="text-sm text-gray-500">{pending.length} terms</span>
              </div>
              <div className="mt-3 divide-y">
                {pending.length === 0 ? (
                  <div className="text-gray-500 text-sm">No sessions to rate.</div>
                ) : pending.map(p => (
                  <div key={p.termId} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{p.programTitle}</div>
                      <div className="text-xs text-gray-500">{new Date(p.startAt).toLocaleString()} • {p.count} participant(s)</div>
                    </div>
                    <button
                      onClick={() => openRate(p.termId)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
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
    </div>
  );
}