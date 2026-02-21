import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type Props = { weekStart: Date; onChange: (newWeekStart: Date) => void; };

export default function WeekSwitcher({ weekStart, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) { if (!ref.current) return; if (!ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const label = useMemo(() => {
    const from = format(weekStart, "MMM d");
    const to = format(addDays(weekStart, 6), "MMM d");
    return `${from} – ${to}`;
  }, [weekStart]);

  const goPrev = () => onChange(addDays(weekStart, -7));
  const goNext = () => onChange(addDays(weekStart, 7));
  const goToday = () => onChange(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="relative" ref={ref}>
      <div className="inline-flex items-center bg-[#222] p-1 rounded-2xl border border-white/5 shadow-inner">
        <button onClick={goPrev} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button onClick={() => setOpen(!open)} className="px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-xl transition-colors">
          <CalendarDays className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-black uppercase tracking-tight text-white">{label}</span>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </button>

        <button onClick={goNext} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-72 rounded-3xl border border-white/10 bg-[#1a1a1a] p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 px-1">Brzi skok</div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 px-1">Izaberi datum</label>
              <input
                type="date"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                onChange={(e) => { if (e.target.value) { onChange(startOfWeek(new Date(e.target.value), { weekStartsOn: 1 })); setOpen(false); }}}
              />
            </div>

            <button 
              onClick={() => { goToday(); setOpen(false); }} 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors border border-white/5"
            >
              <RotateCcw className="w-4 h-4" />
              Vrati na danas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}