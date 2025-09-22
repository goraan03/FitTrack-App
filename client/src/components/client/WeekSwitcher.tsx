import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, getISOWeek, startOfWeek } from "date-fns";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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
    const weekNo = String(getISOWeek(weekStart)).padStart(2, "0");
    return `${from} – ${to} · W${weekNo}`;
  }, [weekStart]);

  const goPrev = () => onChange(addDays(weekStart, -7));
  const goNext = () => onChange(addDays(weekStart, 7));
  const goToday = () => onChange(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const pickDate = (d: Date) => onChange(startOfWeek(d, { weekStartsOn: 1 }));

  const weekInputValue = useMemo(() => {
    const y = format(weekStart, "yyyy");
    const w = String(getISOWeek(weekStart)).padStart(2, "0");
    return `${y}-W${w}`;
  }, [weekStart]);

  function onWeekInputChange(val: string) {
    const m = /^(\d{4})-W(\d{2})$/.exec(val);
    if (!m) return;
    const jan4 = new Date(Number(m[1]), 0, 4);
    const week1 = startOfWeek(jan4, { weekStartsOn: 1 });
    onChange(addDays(week1, (Number(m[2]) - 1) * 7));
  }

  return (
    <div className="relative" ref={ref}>
      <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white text-black px-1 py-1 shadow-sm">
        <button onClick={goPrev} className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-700" title="Previous week">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button onClick={() => setOpen(o=>!o)} className="mx-1 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-gray-100 text-black" title="Change week">
          <CalendarDays className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{label}</span>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </button>

        <button onClick={goNext} className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-700" title="Next week">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white text-black p-4 shadow-lg">
          <div className="text-sm font-semibold text-gray-900">Jump to</div>

          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Pick a date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                onChange={(e) => { if (!e.target.value) return; const d = new Date(e.target.value); if (!Number.isNaN(d.getTime())) { pickDate(d); setOpen(false); } }}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Pick a week</label>
              <input
                type="week"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                value={weekInputValue}
                onChange={(e) => { if (!e.target.value) return; onWeekInputChange(e.target.value); setOpen(false); }}
              />
              <div className="mt-1 text-[11px] text-gray-400">Note: input type=week not supported in all browsers.</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => { goToday(); setOpen(false); }} className="inline-flex items-center rounded-lg border border-yellow-400 text-yellow-600 px-3 py-2 text-sm font-semibold hover:bg-yellow-400/10">
                Today
              </button>

              <div className="text-xs text-gray-500">
                Current: <span className="font-medium text-black">{label}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}