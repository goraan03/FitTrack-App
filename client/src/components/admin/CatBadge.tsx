import { AlertTriangle, Info, XOctagon } from "lucide-react";
import type { AuditCategory } from "../../types/admin/AuditLog";

export const CatBadge = ({ c }: { c: AuditCategory }) => {
  const map: Record<AuditCategory, string> = {
    Informacija: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
    Upozorenje: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
    Greška: "bg-red-100 text-red-800 ring-1 ring-red-200",
  };
  const Icon = c === "Informacija" ? Info : c === "Upozorenje" ? AlertTriangle : XOctagon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[c]}`}>
      <Icon className="h-3.5 w-3.5" /> {c}
    </span>
  );
};