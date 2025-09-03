import { addDays, format } from "date-fns";

export type WeeklyCardItem = {
  id: number;
  title: string;
  day: number;   
  start: string;               // 'HH:mm'
  end: string;                 // 'HH:mm'
  type: 'individual' | 'group';
  cancellable: boolean;
  programTitle?: string;
  trainerName?: string;
};

type Props = {
  weekStart: Date;
  items: WeeklyCardItem[];
  onCancel?: (id: number) => void;
  onDetails?: (id: number) => void;
};

function toDate(weekStart: Date, jsDay: number, hhmm: string) {
  // ui day shift: Mon=0...Sun=6
  const uiDay = (jsDay + 6) % 7;
  const d = addDays(new Date(weekStart), uiDay);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export default function WeeklyCards({ weekStart, items, onCancel, onDetails }: Props) {
  const sorted = [...items].sort((a, b) => {
    const da = toDate(weekStart, a.day, a.start).getTime();
    const db = toDate(weekStart, b.day, b.start).getTime();
    return da - db;
  });

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6 text-center text-gray-500">
        <div className="text-5xl mb-3">📅</div>
        <div>There are no sessions scheduled for this week.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((it) => {
        const startDate = toDate(weekStart, it.day, it.start);
        const endDate = toDate(weekStart, it.day, it.end);
        const dateLabel = format(startDate, "EEE, MMM d");
        const timeLabel = `${format(startDate, "HH:mm")}–${format(endDate, "HH:mm")}`;

        const badge =
          it.type === "group"
            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
            : "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200";

        return (
          <div
            key={it.id}
            className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4 sm:p-5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* FIX: obojena cela pilula (bez ugnježdenog spana) */}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>
                  {it.type === "group" ? "Group" : "Individual"}
                </span>
                <span className="text-xs text-gray-500">{dateLabel}</span>
              </div>
              <div className="mt-1 font-semibold text-gray-900 truncate">
                {it.title}
              </div>
              <div className="text-sm text-gray-600">
                {timeLabel}
                {it.trainerName ? ` • ${it.trainerName}` : ""}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onDetails?.(it.id)}
                className="px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-50"
                title="Details"
              >
                Details
              </button>
              <button
                onClick={() => it.cancellable && onCancel?.(it.id)}
                disabled={!it.cancellable}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-40"
                title={it.cancellable ? "Cancel session" : "Cannot cancel within 60 minutes"}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}