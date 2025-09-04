import { AlertTriangle, Info, XOctagon } from "lucide-react";
import type { AuditCategory } from "../../types/admin/AuditLog";

export const CatBadge = ({ c }: { c: AuditCategory }) => {
  const map: Record<AuditCategory, string> = {
    Informacija: "bg-emerald-100 text-emerald-800",
    Upozorenje: "bg-amber-100 text-amber-800",
    Greška: "bg-red-100 text-red-800",
  };
  const Icon = c === "Informacija" ? Info : c === "Upozorenje" ? AlertTriangle : XOctagon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[c]}`}>
      <Icon className="h-3.5 w-3.5" /> {c}
    </span>
  );
};