import { useEffect, useMemo, useState } from "react";
import { clientApi } from "../../api_services/client/ClientAPIService";
import { format, startOfWeek, addDays } from "date-fns";
import WeeklyCards, { type WeeklyCardItem } from "../../components/client/WeeklyCards";
import TermDetailsModal from "../../components/client/TermDetailsModal";
import WeekSwitcher from "../../components/client/WeekSwitcher";

// Chart
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
import type { ClientProfile, HistoryItem } from "../../api_services/client/IClientAPIService";
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

const normalizeType = (t: unknown): 'individual' | 'group' =>
  String(t).toLowerCase() === 'individual' ? 'individual' : 'group';

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h || 0) * 60 + (m || 0);
  return Number.isFinite(total) ? total : 0;
}

export default function ClientDashboardPage() {
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

  // profil i istorija za desni panel i statse
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
      const mapped: WeeklyCardItem[] = resp.data.events.map((e) => ({
        id: e.termId,
        title: e.programTitle || e.title || "Training",
        day: e.day,
        start: e.start,
        end: e.end,
        type: normalizeType(e.type),
        cancellable: e.cancellable,
        programTitle: e.programTitle,
        trainerName: e.trainerName,
      }));
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

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadWeekly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const handleCancel = async (id: number) => {
    const r = await clientApi.cancel(id);
    if (!r.success) alert(r.message || "Cancel failed");
    await loadWeekly();
  };

  const handleDetails = (id: number) => {
    const ev = events.find((x) => x.id === id);
    if (!ev) return;

    const uiDay = (ev.day + 6) % 7;
    const s = new Date(weekStart);
    s.setDate(s.getDate() + uiDay);
    const [sh, sm] = ev.start.split(":").map(Number);
    s.setHours(sh || 0, sm || 0, 0, 0);

    const e = new Date(weekStart);
    e.setDate(e.getDate() + uiDay);
    const [eh, em] = ev.end.split(":").map(Number);
    e.setHours(eh || 0, em || 0, 0, 0);

    setDetails({
      id: ev.id,
      title: ev.title,
      startAt: s.toISOString(),
      endAt: e.toISOString(),
      type: ev.type,
      trainerName: ev.trainerName,
      programTitle: ev.programTitle,
      exercises: [],
    });
    setDetailsOpen(true);
  };

  // Desni panel: tabs
  const [tab, setTab] = useState<'progress' | 'recent'>('progress');

  // Chart data

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      scales: { y: { suggestedMin: 0, suggestedMax: 10, ticks: { stepSize: 1 } } },
      plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" as const } },
    }),
    []
  );

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back <span className="ml-1">👋</span>
          </h1>
          <p className="text-gray-600">Here&apos;s your fitness journey overview</p>
        </div>

        {/* Week switcher */}
        <WeekSwitcher weekStart={weekStart} onChange={(d) => setWeekStart(d)} />
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Total Sessions</div>
          <div className="text-3xl font-bold mt-2">{profile?.stats.sessionsCompleted ?? 0}</div>
          <div className="text-xs text-gray-500">Sessions completed</div>
        </div>
        <div className="bg-indigo-50 ring-1 ring-indigo-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-3xl font-bold mt-2">
            {profile?.stats.avgRating != null ? profile.stats.avgRating.toFixed(1) : "N/A"}
          </div>
          <div className="text-xs text-gray-500">Out of 10</div>
        </div>
        <div className="bg-orange-50 ring-1 ring-orange-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Scheduled</div>
          <div className="text-3xl font-bold mt-2">{events.length}</div>
          <div className="text-xs text-gray-500">This week • {weekHours}h</div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left: Week cards */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm px-4 py-3">
            <h3 className="text-lg font-semibold">This Week&apos;s Schedule</h3>
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
        <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
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
              <div className="h-64 rounded-xl ring-1 ring-gray-200 bg-white animate-pulse" />
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
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        borderColor: "#10B981",
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