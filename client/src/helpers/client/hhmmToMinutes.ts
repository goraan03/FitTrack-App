export function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h || 0) * 60 + (m || 0);
  return Number.isFinite(total) ? total : 0;
}