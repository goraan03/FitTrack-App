import { format } from "date-fns";
import type { WeeklyCardItem } from "../../models/client/WeeklyCardItem";
import { toDate } from "../../helpers/client/toDate";
import { Calendar, Info, XCircle } from "lucide-react";

type Props = { weekStart: Date; items: WeeklyCardItem[]; onCancel?: (id: number) => void; onDetails?: (id: number) => void; };

export default function WeeklyCards({ weekStart, items, onCancel, onDetails }: Props) {
  const sorted = [...items].sort((a, b) => toDate(weekStart, a.day, a.start).getTime() - toDate(weekStart, b.day, b.start).getTime());

  if (sorted.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex p-5 rounded-full bg-white/5 mb-4 text-gray-600">
          <Calendar className="w-10 h-10" />
        </div>
        <div className="text-gray-400 font-medium">Nema zakazanih termina za ovu sedmicu.</div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      {sorted.map((it) => {
        const s = toDate(weekStart, it.day, it.start);
        const e = toDate(weekStart, it.day, it.end);
        const dayLabel = format(s, "EEE");
        const dateNum = format(s, "d");
        const timeRange = `${format(s, "HH:mm")} – ${format(e, "HH:mm")}`;

        return (
          <div key={it.id} className="group relative flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#1d1d1d]/50 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
            <div className="flex items-center gap-5">
              {/* Date Badge */}
              <div className="flex flex-col items-center justify-center min-w-[56px] h-[56px] rounded-2xl bg-[#262626] group-hover:bg-yellow-400 transition-colors duration-300">
                <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-black/60 tracking-tighter leading-none mb-1">{dayLabel}</span>
                <span className="text-xl font-black text-white group-hover:text-black leading-none">{dateNum}</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    it.type === "group" ? "bg-yellow-400/20 text-yellow-400" : "bg-blue-400/20 text-blue-400"
                  }`}>
                    {it.type}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">{timeRange}</span>
                </div>
                <div className="text-base font-bold text-white truncate group-hover:text-yellow-400 transition-colors">{it.title}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onDetails?.(it.id)} 
                className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Detalji"
              >
                <Info className="w-5 h-5" />
              </button>
              <button
                onClick={() => it.cancellable && onCancel?.(it.id)}
                disabled={!it.cancellable}
                className="p-2.5 rounded-xl border border-red-500/20 text-red-500/50 hover:bg-red-500 hover:text-white disabled:opacity-10 transition-all"
                title="Otkaži termin"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}