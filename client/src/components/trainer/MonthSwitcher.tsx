import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    format,
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

type Props = {
    selectedDate: Date | null; // null means "All Time"
    onChange: (newDate: Date | null) => void
};

export default function MonthSwitcher({ selectedDate, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
        top: 0,
        left: 0,
        width: 0,
    });

    const [viewYear, setViewYear] = useState<number>(() => (selectedDate || new Date()).getFullYear());

    const label = useMemo(() => {
        if (!selectedDate) return "ALL TIME";
        return format(selectedDate, "MMMM yyyy").toUpperCase();
    }, [selectedDate]);

    const goPrev = () => {
        if (!selectedDate) return;
        onChange(subMonths(selectedDate, 1));
    };
    const goNext = () => {
        if (!selectedDate) return;
        onChange(addMonths(selectedDate, 1));
    };

    const measure = () => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({ top: r.bottom + 12, left: r.right, width: r.width });
    };

    useEffect(() => {
        if (!open) return;
        measure();
        const onResize = () => measure();
        const onScroll = () => measure();

        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onScroll, true);

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [open]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const selectMonth = (monthIndex: number) => {
        const newDate = new Date(viewYear, monthIndex, 1);
        onChange(newDate);
        setOpen(false);
    };

    const dropdownLeft = useMemo(() => {
        const width = 320;
        return Math.max(8, Math.min(pos.left - width, window.innerWidth - 8 - width));
    }, [pos.left]);

    return (
        <div className="relative" ref={ref}>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                <button
                    onClick={goPrev}
                    disabled={!selectedDate}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setOpen((o) => !o)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all min-w-[140px] justify-center"
                    aria-label="Select month"
                >
                    <CalendarDays className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-white whitespace-nowrap">{label}</span>
                    <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>

                <button
                    onClick={goNext}
                    disabled={!selectedDate}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20"
                    aria-label="Next month"
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
                w-[320px] max-w-[calc(100vw-2rem)]
                rounded-2xl border border-white/10
                bg-[#1a1a1a]
                shadow-[0_40px_100px_rgba(0,0,0,0.95)]
                overflow-hidden
                backdrop-blur-xl
              "
                            style={{ top: pos.top, left: dropdownLeft }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="p-5">
                                {/* Year Selection */}
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={() => setViewYear(y => y - 1)}
                                        className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition"
                                    >
                                        <ChevronLeft className="w-4 h-4 mx-auto" />
                                    </button>

                                    <div className="text-lg font-black text-white italic">
                                        {viewYear}
                                    </div>

                                    <button
                                        onClick={() => setViewYear(y => y + 1)}
                                        className="w-9 h-9 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition"
                                    >
                                        <ChevronRight className="w-4 h-4 mx-auto" />
                                    </button>
                                </div>

                                {/* Months Grid */}
                                <div className="grid grid-cols-3 gap-2">
                                    {months.map((m, idx) => {
                                        const isSelected = selectedDate &&
                                            selectedDate.getMonth() === idx &&
                                            selectedDate.getFullYear() === viewYear;

                                        return (
                                            <button
                                                key={m}
                                                onClick={() => selectMonth(idx)}
                                                className={`
                          h-12 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                          border border-transparent
                          ${isSelected
                                                        ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                                                        : "text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/10"}
                        `}
                                            >
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* All Time Button */}
                                <div className="mt-6 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            onChange(null);
                                            setOpen(false);
                                        }}
                                        className={`
                      w-full flex items-center justify-center gap-2 py-3
                      rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                      border
                      ${!selectedDate
                                                ? "bg-white text-black border-white"
                                                : "bg-white/5 hover:bg-white/10 text-white border-white/10"}
                    `}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        All Time Progress
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
