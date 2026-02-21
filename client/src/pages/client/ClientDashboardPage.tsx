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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-yellow-500">Dashboard</h1>
          <p className="text-gray-400">Here&apos;s your fitness journey overview</p>
        </div>
        <WeekSwitcher weekStart={weekStart} onChange={(d) => setWeekStart(d)} />
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5">
          <div className="text-sm text-gray-600">Total Sessions</div>
          <div className="text-3xl font-bold mt-2 text-yellow-500">
            {profile?.stats.sessionsCompleted ?? 0}
          </div>
          <div className="text-xs text-gray-500">Sessions completed</div>
        </div>
        <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-3xl font-bold mt-2 text-yellow-500">
            {profile?.stats.avgRating != null ? profile.stats.avgRating.toFixed(1) : "N/A"}
          </div>
          <div className="text-xs text-gray-500">Out of 10</div>
        </div>
        <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5">
          <div className="text-sm text-gray-600">Scheduled</div>
          <div className="text-3xl font-bold mt-2 text-yellow-500">{events.length}</div>
          <div className="text-xs text-gray-500">This week • {weekHours}h</div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left: Week cards */}
        <div className="space-y-3">
          <div className="bg-white text-black rounded-2xl border border-gray-200 shadow px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">This Week&apos;s Schedule</h3>
            <p className="text-gray-600 text-sm">{weekLabel}</p>
          </div>
          <WeeklyCards
            weekStart={weekStart}
            items={events}
            onCancel={handleCancel}
            onDetails={handleDetails}
          />
        </div>

        {/* Right: Progress & Recent */}
        <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {tab === 'progress' ? 'Progress' : 'Recent Activity'}
            </h3>
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setTab('progress')}
                className={`px-3 py-1.5 text-sm rounded-md ${tab === 'progress' ? 'bg-white shadow ring-1 ring-gray-200' : 'text-gray-600'}`}
              >
                Progress
              </button>
              <button
                onClick={() => setTab('recent')}
                className={`px-3 py-1.5 text-sm rounded-md ${tab === 'recent' ? 'bg-white shadow ring-1 ring-gray-200' : 'text-gray-600'}`}
              >
                Recent
              </button>
            </div>
          </div>

          <div className="mt-4">
            {loadingMeta ? (
              <div className="h-64 rounded-2xl border border-gray-200 bg-white shadow animate-pulse" />
            ) : tab === 'progress' ? (
              <div className="h-64">
                {profile?.ratingsTrend?.length ? (
                  <Line data={{
                    labels: profile.ratingsTrend.map((p) => new Date(p.date).toLocaleDateString()),
                    datasets: [
                      {
                        label: "Prosek ocena",
                        data: profile.ratingsTrend.map((p) => p.avg ?? 0),
                        fill: true,
                        backgroundColor: "rgba(250, 204, 21, 0.20)", // yellow-400 @ 20%
                        borderColor: "#EAB308", // yellow-500
                        tension: 0.35,
                        pointRadius: 3,
                      },
                    ],
                  }} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">No data yet</div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {history.length ? (
                  history.map((h) => {
                    const d = new Date(h.date);
                    return (
                      <div key={h.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{h.programTitle}</div>
                          <div className="text-sm text-gray-500">
                            {h.trainerName} • {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {h.rating != null ? `Rating: ${h.rating}/10` : '—'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-gray-400">No recent sessions</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TermDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        data={details}
      />
    </div>
  );
}
