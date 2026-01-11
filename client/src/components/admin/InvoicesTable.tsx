import { useEffect, useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import { RefreshCcw } from "lucide-react";
import type { Invoice, InvoiceStatus } from "../../types/admin/Invoice";

type Props = { adminApi: IAdminAPIService };

const statusLabels: Record<InvoiceStatus, string> = {
  issued: "Issued",
  paid: "Paid",
  overdue: "Overdue",
};

const statusClasses: Record<InvoiceStatus, string> = {
  issued: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  overdue: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function InvoicesTable({ adminApi }: Props) {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await adminApi.getInvoices({
      status: statusFilter === "all" ? undefined : statusFilter,
    });
    setLoading(false);
    if (res.success && res.data) setItems(res.data);
    else setError(res.message || "Greška pri učitavanju računa.");
  };

  const download = async (inv: Invoice) => {
  try {
    await adminApi.downloadInvoicePdf(inv.id);
  } catch (e: any) {
    console.error(e);
    alert(e.message || "Greška pri preuzimanju računa.");
  }
};

  useEffect(() => {
    load();
  }, [statusFilter]); // eslint-disable-line

  const changeStatus = async (inv: Invoice, status: InvoiceStatus) => {
    if (inv.status === status) return;
    const res = await adminApi.setInvoiceStatus(inv.id, status);
    if (res.success) load();
  };

  return (
    <section className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm text-black p-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
          <p className="text-sm text-gray-600">
            Manage and track trainer invoices
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="issued">Issued</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">
              Actions
            </label>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-yellow-400 text-yellow-700 hover:bg-yellow-400/10 font-semibold disabled:opacity-60 transition"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-3 text-gray-700">ID</th>
              <th className="p-3 text-gray-700">Trainer ID</th>
              <th className="p-3 text-gray-700">Period</th>
              <th className="p-3 text-gray-700">Clients</th>
              <th className="p-3 text-gray-700">Amount (EUR)</th>
              <th className="p-3 text-gray-700">Status</th>
              <th className="p-3 text-gray-700">Created</th>
              <th className="p-3 text-gray-700">Paid At</th>
              <th className="p-3 text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={9}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={9}>
                  No invoices found
                </td>
              </tr>
            ) : (
              items.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50/70 transition">
                  <td className="p-3 text-gray-800">{inv.id}</td>
                  <td className="p-3 text-gray-800">{inv.trainerId}</td>
                  <td className="p-3 text-gray-800">{inv.period}</td>
                  <td className="p-3 text-gray-800">{inv.clientCount}</td>
                  <td className="p-3 text-gray-800">{inv.amount.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClasses[inv.status]}`}>
                      {statusLabels[inv.status]}
                    </span>
                  </td>
                  <td className="p-3 text-gray-800">
                    {new Date(inv.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-800">
                    {inv.paidAt ? new Date(inv.paidAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1 min-w-[210px]">
                      <div className="flex gap-1">
                        <button
                          className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium"
                          onClick={() => changeStatus(inv, "paid")}
                        >
                          Mark as paid
                        </button>
                        <button
                          className="flex-1 px-3 py-1.5 rounded-lg border border-rose-500 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-medium"
                          onClick={() => changeStatus(inv, "overdue")}
                        >
                          Overdue
                        </button>
                      </div>
                      <button
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
                        onClick={() => download(inv)}
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}