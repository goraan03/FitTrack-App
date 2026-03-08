import { useState, useRef, useEffect } from "react";

type Option = { value: string; label: string };

interface Props {
  value: string;
  onChange: (lang: string) => void;
  options: Option[];
  className?: string;
}

export function LanguageSelect({ value, onChange, options, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recalculate dropdown position when opened or on resize/scroll
  useEffect(() => {
    const updatePosition = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    
    setDropdownStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const current = options.find(o => o.value === value)?.label || value;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-sm font-semibold transition-all flex items-center justify-between gap-3"
      >
        <span>{current}</span>
        <span className="text-slate-400 text-xs">▾</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 z-[999] mt-2 overflow-y-auto rounded-xl border border-[#27273a] bg-[#0a0a0f] shadow-[0_18px_70px_rgba(0,0,0,0.8)]"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                opt.value === value ? "bg-amber-400/10 text-white font-semibold" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
