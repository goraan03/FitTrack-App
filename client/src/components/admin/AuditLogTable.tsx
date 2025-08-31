import { useEffect, useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import type { AuditLog, AuditCategory } from "../../types/admin/AuditLog";
import { Filter, Search, ChevronLeft, ChevronRight, Info, AlertTriangle, XOctagon } from "lucide-react";

type Props = { adminApi: IAdminAPIService };

const CatBadge = ({ c }: { c: AuditCategory }) => {
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

export default function AuditLogTable({ adminApi }: Props) {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [category, setCategory] = useState<AuditCategory | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminApi.getAuditLogs({ page, pageSize, category: category || undefined, search: search || undefined });
    setLoading(false);
    if (res.success && res.data) { setItems(res.data.items); setTotal(res.data.total); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, category]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm">
      {/* Filter bar */}
      <div className="p-4 sm:p-5 border-b">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Filter className="h-4 w-4" />
            Filter & Pretraživanje
          </div>
          <div className="flex flex-1 gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
                placeholder="Pretraži akciju ili email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
              />
            </div>
            <select
              className="rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              value={category}
              onChange={(e) => { setCategory(e.target.value as any); setPage(1); }}
            >
              <option value="">Sve</option>
              <option value="Informacija">Informacija</option>
              <option value="Upozorenje">Upozorenje</option>
              <option value="Greška">Greška</option>
            </select>
            <button
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              onClick={() => { setPage(1); load(); }}
            >
              Primeni
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 font-semibold text-gray-700">Vreme</th>
              <th className="p-3 font-semibold text-gray-700">Kategorija</th>
              <th className="p-3 font-semibold text-gray-700">Akcija</th>
              <th className="p-3 font-semibold text-gray-700">Korisnik</th>
              <th className="p-3 font-semibold text-gray-700">Detalji</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan={5}>Učitavanje...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-6 text-gray-500" colSpan={5}>Nema logova</td></tr>
            ) : (
              items.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50/60">
                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3"><CatBadge c={r.category} /></td>
                  <td className="p-3 font-medium text-gray-900">{r.action}</td>
                  <td className="p-3 text-gray-700">{r.username ?? `#${r.userId ?? "-"}`}</td>
                  <td className="p-3">
                    <pre className="text-xs whitespace-pre-wrap break-all text-gray-600">
                      {r.details ? JSON.stringify(r.details, null, 2) : "-"}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Stranica {page} / {pages} ({total} stavki)
        </span>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Preth
          </button>
          <button
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border disabled:opacity-50"
            disabled={page >= pages}
            onClick={() => setPage(p => Math.min(pages, p + 1))}
          >
            Sledeća <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}