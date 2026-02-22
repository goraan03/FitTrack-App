import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addDays,
  format,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

type Props = { weekStart: Date; onChange: (newWeekStart: Date) => void };

export default function WeekSwitcher({ weekStart, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));

  const label = useMemo(() => {
    const from = format(weekStart, "MMM d");
    const to = format(addDays(weekStart, 6), "MMM d");
    return `${from} – ${to}`.toUpperCase();
  }, [weekStart]);

  const goPrev = () => onChange(addDays(weekStart, -7));
  const goNext = () => onChange(addDays(weekStart, 7));
  const goToday = () => onChange(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 12, left: r.right, width: r.width });
  };

  useEffect(() => {
    if (!open) return;

    setViewMonth(startOfMonth(weekStart));

    measure();
    const onResize = () => measure();
    const onScroll = () => measure();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, weekStart]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = addDays(startOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }), 6);

    const res: Date[] = [];
    let cur = start;
    while (cur <= end) {
      res.push(cur);
      cur = addDays(cur, 1);
    }
    return res;
  }, [viewMonth]);

  const selectedDay = useMemo(() => startOfDay(weekStart), [weekStart]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const selectDate = (d: Date) => {
    onChange(startOfWeek(d, { weekStartsOn: 1 }));
    setOpen(false);
  };

  const dropdownLeft = useMemo(() => {
    const width = 360;
    return Math.max(8, Math.min(pos.left - width, window.innerWidth - 8 - width));
  }, [pos.left]);

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2 bg-[#111118] rounded-xl p-1.5 border border-[#27273a] shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <button
          onClick={goPrev}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
          aria-label="Select week"
        >
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white whitespace-nowrap">{label}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <button
          onClick={goNext}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {open &&
        createPortal(
          <>
            {/* overlay */}
            <div className="fixed inset-0 z-[9998]" onMouseDown={() => setOpen(false)} />

            {/* dropdown */}
            <div
              className="
                fixed z-[9999]
                w-[360px] max-w-[calc(100vw-2rem)]
                rounded-2xl border border-[#2f2f44]
                bg-[#111118]
                shadow-[0_30px_90px_rgba(0,0,0,0.90)]
                overflow-hidden
              "
              style={{ top: pos.top, left: dropdownLeft }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                  QUICK JUMP
                </div>

                {/* Calendar header */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setViewMonth((m) => subMonths(m, 1))}
                    className="w-9 h-9 rounded-lg border border-[#2f2f44] text-slate-300 hover:bg-white/5 transition"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4 mx-auto" />
                  </button>

                  <div className="text-sm font-semibold text-white">
                    {format(viewMonth, "MMMM yyyy")}
                  </div>

                  <button
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="w-9 h-9 rounded-lg border border-[#2f2f44] text-slate-300 hover:bg-white/5 transition"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4 mx-auto" />
                  </button>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div
                      key={d}
                      className="text-[11px] text-slate-500 font-semibold text-center py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d) => {
                    const inMonth = isSameMonth(d, viewMonth);
                    const isToday = isSameDay(d, today);
                    const isSelected = isSameDay(d, selectedDay);

                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => selectDate(d)}
                        className={[
                          "h-10 rounded-lg text-sm font-semibold transition-all",
                          "border border-transparent",
                          inMonth ? "text-slate-200" : "text-slate-600",
                          isSelected
                            ? "bg-amber-400 text-[#0a0a0f] border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
                            : "hover:bg-white/5",
                          isToday && !isSelected ? "border-[#2f2f44]" : "",
                        ].join(" ")}
                        aria-label={format(d, "yyyy-MM-dd")}
                      >
                        {format(d, "d")}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="mt-5">
                  <button
                    onClick={() => {
                      goToday();
                      setOpen(false);
                    }}
                    className="
                      w-full flex items-center justify-center gap-2 py-3
                      rounded-xl bg-white/5 hover:bg-white/10
                      text-white text-sm font-semibold transition-colors
                      border border-white/5
                    "
                  >
                    <RotateCcw className="w-4 h-4" />
                    Back to today
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}