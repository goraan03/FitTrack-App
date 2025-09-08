import { useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (val: string) => void;
  length?: number;
};

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const refs = Array.from({ length }, () => useRef<HTMLInputElement>(null));
  const vals = value.padEnd(length, ' ').slice(0, length).split('');

  const setChar = (idx: number, ch: string) => {
    const next = (value.slice(0, idx) + ch + value.slice(idx + 1))
      .slice(0, length)
      .replace(/\s/g, '');
    onChange(next);
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    if (!onlyDigits) {
      setChar(i, '');
      return;
    }
    setChar(i, onlyDigits[onlyDigits.length - 1]);
    if (i < length - 1) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs[i - 1].current?.focus();
    if ((e.key === 'ArrowLeft') && i > 0) refs[i - 1].current?.focus();
    if ((e.key === 'ArrowRight') && i < length - 1) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const clip = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (clip) onChange(clip);
    refs[Math.min(clip.length, length - 1)].current?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          inputMode="numeric"
          maxLength={1}
          aria-label={`OTP digit ${i + 1}`}
          value={vals[i] === ' ' ? '' : vals[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="text-center text-lg h-12 rounded-xl border border-gray-300 bg-white shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      ))}
    </div>
  );
}