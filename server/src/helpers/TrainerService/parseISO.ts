export function parseISO(d?: string): Date | null {
  return d ? new Date(d) : null;
}