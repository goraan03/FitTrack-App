// client/src/pages/client/ClientDashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { clientApi } from "../../api_services/client/ClientAPIService";
import { format, startOfWeek, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import WeeklyCards from "../../components/client/WeeklyCards";
import type { WeeklyCardItem } from "../../components/client/WeeklyCards";
import TermDetailsModal from "../../components/client/TermDetailsModal";

export default function ClientDashboardPage() {
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
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

  const weekLabel = useMemo(() => {
    const from = format(weekStart, "MMM d");
    const to = format(addDays(weekStart, 6), "MMM d");
    return `${from} - ${to}`;
  }, [weekStart]);

  const load = async () => {
    const resp = await clientApi.getWeeklySchedule(weekStart.toISOString());
    if (resp.success && resp.data) {
      // map API events -> cards
      const mapped: WeeklyCardItem[] = resp.data.events.map((e) => ({
        id: e.termId,
        title: e.programTitle || e.title || "Training",
        day: e.day,
        start: e.start,
        end: e.end,
        type: e.type,
        cancellable: e.cancellable,
        programTitle: e.programTitle,
        trainerName: e.trainerName,
      }));
      setEvents(mapped);
    } else {
      setEvents([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const goPrev = () => setWeekStart(addDays(weekStart, -7));
  const goNext = () => setWeekStart(addDays(weekStart, 7));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handleCancel = async (id: number) => {
    const r = await clientApi.cancel(id);
    if (!r.success) {
      alert(r.message || "Cancel failed");
    }
    await load();
  };

  const handleDetails = (id: number) => {
    const ev = events.find((x) => x.id === id);
    if (!ev) return;

    // build start/end ISO based on weekStart + day + hh:mm
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
      exercises: [], // kada bude API za vežbe, popuniti
    });
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back <span className="ml-1">👋</span>
          </h1>
          <p className="text-gray-600">Here&apos;s your fitness journey overview</p>
        </div>

        {/* Week controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border hover:bg-gray-50"
            title="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToday}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50"
            title="This week"
          >
            <CalendarDays className="h-4 w-4" />
            Today
          </button>
          <button
            onClick={goNext}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border hover:bg-gray-50"
            title="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Stats (placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Total Sessions</div>
          <div className="text-3xl font-bold mt-2">0</div>
          <div className="text-xs text-gray-500">Sessions completed</div>
        </div>
        <div className="bg-indigo-50 ring-1 ring-indigo-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-3xl font-bold mt-2">N/A</div>
          <div className="text-xs text-gray-500">Out of 10</div>
        </div>
        <div className="bg-orange-50 ring-1 ring-orange-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Upcoming</div>
          <div className="text-3xl font-bold mt-2">{events.length}</div>
          <div className="text-xs text-gray-500">This week</div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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

        <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
          <p className="text-gray-600 text-sm">Your next training sessions</p>
          <div className="mt-6 text-center text-gray-500">
            <div className="text-5xl mb-3">〰️</div>
            <div>No upcoming sessions</div>
            <a
              href="/app/sessions"
              className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 transition"
            >
              Browse Sessions
            </a>
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