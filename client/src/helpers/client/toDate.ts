export function toDate(weekStart: Date, day: number, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(weekStart);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}