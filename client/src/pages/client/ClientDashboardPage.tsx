import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays, setHours, setMinutes, addMinutes } from "date-fns";
import TermDetailsModal from "../../components/client/TermDetailsModal";
import WeekSwitcher from "../../components/client/WeekSwitcher";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { WeeklyCardItem } from "../../models/client/WeeklyCardItem";
import type { ClientProfile } from "../../types/users/ClientProfile";
import type { HistoryItem } from "../../models/client/HistoryItem";
import WeeklyCards from "../../components/client/WeeklyCards";
import { hhmmToMinutes } from "../../helpers/client/hhmmToMinutes";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";
import { programsApi } from "../../api_services/programs/ProgramsAPIService";
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

const normalizeType = (t: unknown): 'individual' | 'group' =>
  String(t).toLowerCase() === 'individual' ? 'individual' : 'group';

interface ClientDashboardPageProps {
  clientApi: IClientAPIService;
}

export default function ClientDashboardPage({ clientApi }: ClientDashboardPageProps) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [events, setEvents] = useState<WeeklyCardItem[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState<{
    id: number;
    title: string;
    startAt: string;
    endAt: string;
    type: 'individual'|'group';
    trainerName?: string;
    programTitle?: string;
    exercises?: string[];
  }>();

  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const weekLabel = useMemo(() => {
    const from = format(weekStart, "MMM d");
    const to = format(addDays(weekStart, 6), "MMM d");
    return `${from} - ${to}`;
  }, [weekStart]);

  const weekMinutes = useMemo(() => {
    return events.reduce((sum, e) => {
      const dur = Math.max(0, hhmmToMinutes(e.end) - hhmmToMinutes(e.start));
      return sum + dur;
    }, 0);
  }, [events]);
  const weekHours = useMemo(() => (weekMinutes / 60).toFixed(1), [weekMinutes]);

  const loadWeekly = async () => {
    const resp = await clientApi.getWeeklySchedule(weekStart.toISOString());
    if (resp.success && resp.data) {
      const weekStartMidnight = new Date(weekStart);
      weekStartMidnight.setHours(0, 0, 0, 0);

      const mapped: WeeklyCardItem[] = resp.data.events.map((e) => {
        const startDate = e.startAt ? new Date(e.startAt) : (() => {
          const d = addDays(weekStart, e.day ?? 0);
          const [hh, mm] = (e.start || "00:00").split(":").map(Number);
          return setMinutes(setHours(d, hh || 0), mm || 0);
        })();
        const endDate = e.durationMin
          ? addMinutes(startDate, e.durationMin)
          : (() => {
              const d = addDays(weekStart, e.day);
              const [hh, mm] = (e.end || "00:00").split(":").map(Number);
              return setMinutes(setHours(d, hh || 0), mm || 0);
            })();
        const startMidnight = new Date(startDate);
        startMidnight.setHours(0, 0, 0, 0);
        const dayIdx = Math.round(
          (startMidnight.getTime() - weekStartMidnight.getTime()) / (24 * 60 * 60 * 1000)
        );
        return {
          id: e.termId,
          title: e.programTitle || e.title || "Training",
          day: dayIdx,
          start: format(startDate, "HH:mm"),
          end: format(endDate, "HH:mm"),
          type: normalizeType(e.type),
          cancellable: e.cancellable,
          completed: e.completed,
          programTitle: e.programTitle,
          trainerName: e.trainerName,
          programId: e.programId,
        };
      });
      setEvents(mapped);
    } else {
      setEvents([]);
    }
  };

  const loadMeta = async () => {
    try {
      setLoadingMeta(true);
      const [p, h] = await Promise.all([clientApi.getMyProfile(), clientApi.getHistory()]);
      setProfile(p?.data ?? null);
      setHistory(h?.data?.items?.slice(0, 5) ?? []);
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => { loadWeekly(); }, [weekStart]);

  const handleCancel = async (id: number) => {
    const r = await clientApi.cancel(id);
    if (!r.success) alert(r.message || "Cancel failed");
    await loadWeekly();
  };

  const handleDetails = async (id: number) => {
    const ev = events.find((x) => x.id === id);
    if (!ev) return;

    const [sh, sm] = ev.start.split(":").map(Number);
    const [eh, em] = ev.end.split(":").map(Number);
    
    let startDate = addDays(weekStart, ev.day);
    startDate = setHours(startDate, sh || 0);
    startDate = setMinutes(startDate, sm || 0);
    
    let endDate = addDays(weekStart, ev.day);
    endDate = setHours(endDate, eh || 0);
    endDate = setMinutes(endDate, em || 0);

    let exerciseNames: string[] = [];

    try {
      console.log("DETAILS ev:", ev, "profile:", profile);
      if (ev.programId && profile?.assignedTrainerId != null && profile?.id) {

        console.log("Calling getVisibleDetails with", {
        programId: ev.programId,
        trainerId: profile.assignedTrainerId,
        clientId: profile.id,
      });

        const res = await programsApi.getVisibleDetails({
          programId: ev.programId,
          trainerId: profile.assignedTrainerId,
          clientId: profile.id,
        });

         console.log("getVisibleDetails response:", res);
        if (res.success && res.data) {
          exerciseNames = res.data.exercises.map(ex => ex.name);
          console.log("exerciseNames:", exerciseNames);
        }
      } else {
        console.warn("Missing programId or trainerId/id in profile, skipping fetch");
      }
    } catch (err) {
      console.error("Failed to load program details for term", err);
    }

    setDetails({
      id: ev.id,
      title: ev.title,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      type: ev.type,
      trainerName: ev.trainerName,
      programTitle: ev.programTitle,
      exercises: exerciseNames,
    });
    setDetailsOpen(true);
};

  const [tab, setTab] = useState<'progress' | 'recent'>('progress');

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      scales: { y: { suggestedMin: 0, suggestedMax: 10, ticks: { stepSize: 1 } } },
      plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" as const } },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-white/5 via-white/0 to-transparent pointer-events-none" />

      <div className="pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
          {/* Header */}
          <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 opacity-0 animate-fade-in-up">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                CLIENT <span className="text-amber-400">DASHBOARD</span>
              </h1>
              <p className="text-slate-400 text-sm tracking-wide uppercase">
                Your weekly overview & progress
              </p>
            </div>

            <WeekSwitcher weekStart={weekStart} onChange={(d) => setWeekStart(d)} />
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              className="stat-card-1 rounded-2xl p-6 card-hover opacity-0 animate-fade-in-up stagger-1"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0a0a0f]/50 flex items-center justify-center text-amber-400">
                  <span className="text-xs font-black uppercase tracking-widest">#</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">SESSIONS</p>
                  <p className="text-4xl font-bold text-white">
                    {profile?.stats.sessionsCompleted ?? 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Completed total</p>
            </div>

            <div
              className="stat-card-2 rounded-2xl p-6 card-hover opacity-0 animate-fade-in-up stagger-2"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0a0a0f]/50 flex items-center justify-center text-cyan-400">
                  <span className="text-xs font-black uppercase tracking-widest">★</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">AVG RATING</p>
                  <p className="text-4xl font-bold text-white">
                    {profile?.stats.avgRating != null ? profile.stats.avgRating.toFixed(1) : "—"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Out of 10</p>
            </div>

            <div
              className="stat-card-3 rounded-2xl p-6 card-hover opacity-0 animate-fade-in-up stagger-3"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0a0a0f]/50 flex items-center justify-center text-violet-400">
                  <span className="text-xs font-black uppercase tracking-widest">⏱</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">SCHEDULED</p>
                  <p className="text-4xl font-bold text-white">{events.length}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">This week • {weekHours}h</p>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-5">
            {/* Left: Week schedule */}
            <div
              className="lg:col-span-3 opacity-0 animate-fade-in-up stagger-4"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-white">WEEKLY SCHEDULE</h2>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">{weekLabel}</p>
                </div>
              </div>

              <div className="bg-[#0a0a0f]">
                <WeeklyCards
                  weekStart={weekStart}
                  items={events}
                  onCancel={handleCancel}
                  onDetails={handleDetails}
                />
              </div>
            </div>

            {/* Right: Progress / Recent */}
            <div
              className="lg:col-span-2 opacity-0 animate-fade-in-up stagger-5"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full" />
                <h2 className="text-xl font-bold text-white">
                  {tab === "progress" ? "PROGRESS" : "RECENT"}
                </h2>
              </div>

              <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">
                    {tab === "progress" ? "Ratings trend" : "Recent sessions"}
                  </div>

                  <div className="inline-flex rounded-xl bg-black/40 border border-white/5 p-1">
                    <button
                      onClick={() => setTab("progress")}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        tab === "progress"
                          ? "bg-white/5 text-amber-400 border border-amber-400/20"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Progress
                    </button>
                    <button
                      onClick={() => setTab("recent")}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        tab === "recent"
                          ? "bg-white/5 text-amber-400 border border-amber-400/20"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Recent
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  {loadingMeta ? (
                    <div className="h-64 rounded-2xl border border-white/5 bg-black/30 animate-pulse" />
                  ) : tab === "progress" ? (
                    <div className="h-64">
                      {profile?.ratingsTrend?.length ? (
                        <Line
                          data={{
                            labels: profile.ratingsTrend.map((p) =>
                              new Date(p.date).toLocaleDateString()
                            ),
                            datasets: [
                              {
                                label: "Avg rating",
                                data: profile.ratingsTrend.map((p) => p.avg ?? 0),
                                fill: true,
                                backgroundColor: "rgba(251, 191, 36, 0.16)",
                                borderColor: "rgba(251, 191, 36, 0.95)",
                                tension: 0.35,
                                pointRadius: 3,
                              },
                            ],
                          }}
                          options={chartOptions}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                          No data yet
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {history.length ? (
                        history.map((h) => {
                          const d = new Date(h.date);
                          return (
                            <div key={h.id} className="py-3 flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate">
                                  {h.programTitle}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {h.trainerName} •{" "}
                                  {d.toLocaleDateString()}{" "}
                                  {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 whitespace-nowrap">
                                {h.rating != null ? `Rating: ${h.rating}/10` : "—"}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-12 text-center text-slate-500">No recent sessions</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <TermDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} data={details} />
        </div>
      </div>
    </div>
  );
}
