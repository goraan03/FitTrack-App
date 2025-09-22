import { format } from "date-fns";
import type { WeeklyCardItem } from "../../models/client/WeeklyCardItem";
import { toDate } from "../../helpers/client/toDate";

type Props = { weekStart: Date; items: WeeklyCardItem[]; onCancel?: (id: number) => void; onDetails?: (id: number) => void; };

export default function WeeklyCards({ weekStart, items, onCancel, onDetails }: Props) {
  const sorted = [...items].sort((a, b) => toDate(weekStart, a.day, a.start).getTime() - toDate(weekStart, b.day, b.start).getTime());

  if (sorted.length === 0) {
    return (
      <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-6 text-center">
        <div className="text-5xl mb-3">📅</div>
        <div className="text-gray-600">There are no sessions scheduled for this week.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((it) => {
        const s = toDate(weekStart, it.day, it.start);
        const e = toDate(weekStart, it.day, it.end);
        const dateLabel = format(s, "EEE, MMM d");
        const timeLabel = `${format(s, "HH:mm")}–${format(e, "HH:mm")}`;

        const badge = it.type === "group"
          ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200"
          : "bg-gray-100 text-gray-800 ring-1 ring-gray-200";

        return (
          <div key={it.id} className="bg-white text-black rounded-2xl border border-gray-200 shadow p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>{it.type === "group" ? "Group" : "Individual"}</span>
                <span className="text-xs text-gray-500">{dateLabel}</span>
              </div>
              <div className="mt-1 font-semibold text-gray-900 truncate">{it.title}</div>
              <div className="text-sm text-gray-600">{timeLabel}{it.trainerName ? ` • ${it.trainerName}` : ""}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => onDetails?.(it.id)} className="px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100">Details</button>
              <button
                onClick={() => it.cancellable && onCancel?.(it.id)}
                disabled={!it.cancellable}
                className="px-3 py-2 rounded-xl border border-yellow-400 text-yellow-700 hover:bg-yellow-400/10 disabled:opacity-40"
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