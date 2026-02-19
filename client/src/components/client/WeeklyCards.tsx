import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { WeeklyCardItem } from "../../models/client/WeeklyCardItem";
import { toDate } from "../../helpers/client/toDate";
import { Calendar, Info, XCircle, CheckCircle2, Play } from "lucide-react";

type Props = { 
  weekStart: Date; 
  items: WeeklyCardItem[]; 
  onCancel?: (id: number) => void; 
  onDetails?: (id: number) => void;
  isTrainer?: boolean;
};

export default function WeeklyCards({ weekStart, items, onCancel, onDetails, isTrainer }: Props) {
  const navigate = useNavigate();
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
        
        // ✅ Check da li je termin startable (počinje u narednih 15 min ili je već počeo ali nije završen)
        const now = new Date();
        const startTime = s.getTime();
        const endTime = e.getTime();
        const nowTime = now.getTime();
        const isStartable = !it.completed && nowTime >= (startTime - 15 * 60 * 1000) && nowTime < endTime;

        return (
          <div 
            key={it.id} 
            className={`group relative flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
              it.completed 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-[#1d1d1d]/50 hover:bg-white/5 border-transparent hover:border-white/10'
            }`}
          >
            <div className="flex items-center gap-5">
              {/* Date Badge */}
              <div className={`flex flex-col items-center justify-center min-w-[56px] h-[56px] rounded-2xl transition-colors duration-300 ${
                it.completed
                  ? 'bg-green-500/20'
                  : 'bg-[#262626] group-hover:bg-yellow-400'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-tighter leading-none mb-1 ${
                  it.completed 
                    ? 'text-green-400'
                    : 'text-gray-500 group-hover:text-black/60'
                }`}>
                  {dayLabel}
                </span>
                <span className={`text-xl font-black leading-none ${
                  it.completed
                    ? 'text-green-400'
                    : 'text-white group-hover:text-black'
                }`}>
                  {dateNum}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    it.type === "group" ? "bg-yellow-400/20 text-yellow-400" : "bg-blue-400/20 text-blue-400"
                  }`}>
                    {it.type}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">{timeRange}</span>
                  
                  {/* ✅ COMPLETED BADGE */}
                  {it.completed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-md text-[9px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="h-3 w-3" />
                      Završeno
                    </span>
                  )}
                </div>
                <div className={`text-base font-bold truncate transition-colors ${
                  it.completed 
                    ? 'text-green-400'
                    : 'text-white group-hover:text-yellow-400'
                }`}>
                  {it.title}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* ✅ START WORKOUT BUTTON (samo za trenera i samo ako nije completed) */}
              {isTrainer && !it.completed && isStartable && (
                <button
                  onClick={() => navigate(`/trainer/workout/${it.id}`)}
                  className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-yellow-400/50 flex items-center gap-2"
                  title="Započni trening"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Započni
                </button>
              )}

              {/* ✅ COMPLETED STATE (za trenera) */}
              {isTrainer && it.completed && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-bold text-green-400">Završeno</span>
                </div>
              )}

              {/* Details button */}
              <button 
                onClick={() => onDetails?.(it.id)} 
                className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Detalji"
              >
                <Info className="w-5 h-5" />
              </button>

              {/* Cancel button (samo ako nije completed) */}
              {!it.completed && (
                <button
                  onClick={() => it.cancellable && onCancel?.(it.id)}
                  disabled={!it.cancellable}
                  className="p-2.5 rounded-xl border border-red-500/20 text-red-500/50 hover:bg-red-500 hover:text-white disabled:opacity-10 transition-all"
                  title="Otkaži termin"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
