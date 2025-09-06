export function decodeDetails(raw: any): any {
  if (raw === null || raw === undefined) return null;
  try {
    if (typeof raw === "string") {
      const s = raw.trim();
      if (s === "" || s.toLowerCase() === "null") return null;
      return JSON.parse(s);
    }
    if (Buffer.isBuffer(raw)) {
      const s = raw.toString("utf8").trim();
      if (s === "" || s.toLowerCase() === "null") return null;
      return JSON.parse(s);
    }
    return raw;
  } catch {
    try {
      return String(raw);
    } catch {
      return null;
    }
  }
}