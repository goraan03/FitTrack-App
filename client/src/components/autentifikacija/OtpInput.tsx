import { useMemo, useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (val: string) => void;
  length?: number;
};

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const vals = useMemo(
    () => value.padEnd(length, " ").slice(0, length).split(""),
    [value, length]
  );

  const focusAt = (idx: number) => {
    inputRefs.current[idx]?.focus();
  };

  const setChar = (idx: number, ch: string) => {
    const nextArr = vals.map((v) => (v === " " ? "" : v));
    nextArr[idx] = ch;

    const next = nextArr.join("").replace(/\s/g, "").slice(0, length);
    onChange(next);
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    if (!onlyDigits) {
      setChar(i, "");
      return;
    }

    setChar(i, onlyDigits[onlyDigits.length - 1]);
    if (i < length - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const cur = vals[i] === " " ? "" : vals[i];
      if (!cur && i > 0) {
        focusAt(i - 1);
      } else {
        setChar(i, "");
      }
      return;
    }

    if (e.key === "ArrowLeft" && i > 0) focusAt(i - 1);
    if (e.key === "ArrowRight" && i < length - 1) focusAt(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const clip = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!clip) return;

    onChange(clip);
    focusAt(Math.min(clip.length, length - 1));
  };

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`OTP digit ${i + 1}`}
          value={vals[i] === " " ? "" : vals[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="
            h-12 w-full
            rounded-xl
            border border-[#27273a]
            bg-black/30
            text-white
            text-center text-lg font-black
            shadow-[0_10px_30px_rgba(0,0,0,0.35)]
            placeholder:text-slate-600
            transition
            focus:outline-none
            focus:border-white/20
            focus:ring-2 focus:ring-white/10
          "
        />
      ))}
    </div>
  );
}