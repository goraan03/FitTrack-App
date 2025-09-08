import { useEffect, useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import type { AuditLog, AuditCategory } from "../../types/admin/AuditLog";
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { CatBadge } from "./CatBadge";

type Props = { adminApi: IAdminAPIService };

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
    const res = await adminApi.getAuditLogs({
      page,
      pageSize,
      category: category || undefined,
      search: search || undefined,
    });
    setLoading(false);
    if (res.success && res.data) {
      setItems(res.data.items);
      setTotal(res.data.total);
    }
  };

  useEffect(() => {
    load();
  }, [page, category]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Filter className="h-4 w-4" />
            Filter and Search
          </div>
          <div className="flex flex-1 gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition placeholder:text-gray-400 bg-white"
                placeholder="Search action or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
              />
            </div>
            <select
              className="rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="Informacija">Information</option>
              <option value="Upozorenje">Warning</option>
              <option value="Greška">Error</option>
            </select>
            <button
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm transition"
              onClick={() => {
                setPage(1);
                load();
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 font-semibold text-gray-700">Time</th>
              <th className="p-3 font-semibold text-gray-700">Category</th>
              <th className="p-3 font-semibold text-gray-700">Action</th>
              <th className="p-3 font-semibold text-gray-700">User</th>
              <th className="p-3 font-semibold text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="p-6 text-gray-500" colSpan={5}>
                  No logs found
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/70 transition">
                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <CatBadge c={r.category} />
                  </td>
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

      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Page {page} / {pages} ({total} items)
        </span>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}