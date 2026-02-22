import { format } from "date-fns";
import type { WeeklyCardItem } from "../../models/client/WeeklyCardItem";
import { toDate } from "../../helpers/client/toDate";
import { Calendar, XCircle, CheckCircle2, MoreVertical } from "lucide-react";

type Props = {
  weekStart: Date;
  items: WeeklyCardItem[];
  onCancel?: (id: number) => void;
  onDetails?: (id: number) => void;
  isTrainer?: boolean;
};

export default function WeeklyCards({ weekStart, items, onCancel, onDetails }: Props) {
  const sorted = [...items].sort(
    (a, b) => toDate(weekStart, a.day, a.start).getTime() - toDate(weekStart, b.day, b.start).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-[#111118] rounded-2xl p-10 border border-[#27273a] text-center shadow-xl">
        <div className="inline-flex p-4 rounded-full bg-[#0a0a0f] border border-[#27273a] mb-4 text-slate-500">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="text-slate-400 font-medium">No scheduled sessions for this week.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((it) => {
        const s = toDate(weekStart, it.day, it.start);
        const e = toDate(weekStart, it.day, it.end);
        const dayLabel = format(s, "EEE").toUpperCase();
        const dateNum = format(s, "d");
        const timeRange = `${format(s, "HH:mm")} – ${format(e, "HH:mm")}`;
        const isGroup = it.type === "group";

        return (
          <div
            key={it.id}
            className={`
              relative flex items-center gap-3 sm:gap-5 p-4 sm:p-5 
              bg-[#111118] rounded-2xl border border-[#27273a] 
              transition-all duration-300 hover:border-white/10
              ${it.completed ? "opacity-90" : ""}
            `}
          >
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
              it.completed ? "bg-emerald-500" : isGroup ? "bg-cyan-400" : "bg-amber-400"
            }`} />

            {/* DATE BOX */}
            <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[56px] h-14 bg-[#0a0a0f] rounded-xl border border-[#27273a] shrink-0">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{dayLabel}</span>
              <span className="text-lg font-black text-white leading-none">{dateNum}</span>
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`
                  text-[9px] font-black uppercase px-2 py-0.5 rounded-md border
                  ${isGroup ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/20" : "bg-amber-400/10 text-amber-400 border-amber-400/20"}
                `}>
                  {isGroup ? "GROUP" : "INDIVIDUAL"}
                </span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                  {timeRange}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate uppercase tracking-tight">
                {it.title}
              </h3>
            </div>

            {/* ACTIONS & STATUS */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {it.completed && (
                <div className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              {/* CANCEL BUTTON */}
              {!it.completed && it.cancellable && (
                <button
                  onClick={() => onCancel?.(it.id)}
                  className="p-2 rounded-lg border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white transition-all"
                  title="Cancel"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}

              {/* MORE/DETAILS */}
              <button
                onClick={() => onDetails?.(it.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}