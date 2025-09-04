import { addDays } from "date-fns";

export function toDate(weekStart: Date, jsDay: number, hhmm: string) {
  // ui day shift: Mon=0...Sun=6
  const uiDay = (jsDay + 6) % 7;
  const d = addDays(new Date(weekStart), uiDay);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}