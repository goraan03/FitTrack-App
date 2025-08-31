import { useEffect, useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import type { AuditLog, AuditCategory } from "../../types/admin/AuditLog";

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
    const res = await adminApi.getAuditLogs({ page, pageSize, category: category || undefined, search: search || undefined });
    setLoading(false);
    if (res.success && res.data) {
      setItems(res.data.items);
      setTotal(res.data.total);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold">Audit log</h3>
        <div className="flex gap-3">
          <div>
            <label className="text-xs text-gray-500 block">Kategorija</label>
            <select
              className="border rounded-lg px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="">Sve</option>
              <option value="Informacija">Informacija</option>
              <option value="Upozorenje">Upozorenje</option>
              <option value="Greška">Greška</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block">Pretraga</label>
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="action/username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
            />
          </div>
          <button className="px-4 py-2 rounded-lg border" onClick={() => { setPage(1); load(); }}>
            Primeni
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Vreme</th>
              <th className="p-2">Kategorija</th>
              <th className="p-2">Akcija</th>
              <th className="p-2">Korisnik</th>
              <th className="p-2">Detalji</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={5}>Učitavanje...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan={5}>Nema zapisa</td></tr>
            ) : (
              items.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{r.action}</td>
                  <td className="p-2">{r.username ?? `#${r.userId ?? "-"}`}</td>
                  <td className="p-2">
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {r.details ? JSON.stringify(r.details) : "-"}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          Strana {page} / {pages} ({total} zapisa)
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-md border disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ←
          </button>
          <button
            className="px-3 py-1 rounded-md border disabled:opacity-50"
            disabled={page >= pages}
            onClick={() => setPage(p => Math.min(pages, p + 1))}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}