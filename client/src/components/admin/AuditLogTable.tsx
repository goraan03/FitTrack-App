import { useEffect, useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import type { AuditLog, AuditCategory } from "../../types/admin/AuditLog";
import { Filter, Search, ChevronLeft, ChevronRight, Info, AlertTriangle, XCircle, Clock } from "lucide-react";

type Props = { adminApi: IAdminAPIService };

// Human-readable labels for action codes
const ACTION_LABELS: Record<string, string> = {
  REGISTER_SUCCESS: "✅ New registration",
  REGISTER_INVALID_INPUT: "⚠️ Registration failed — bad input",
  REGISTER_CONFLICT_EXISTING_USER: "⚠️ Registration failed — email exists",
  ADMIN_CREATE_TRAINER: "➕ Trainer created by admin",
  ADMIN_BLOCK_USER: "🔒 User blocked by admin",
  ADMIN_UNBLOCK_USER: "🔓 User unblocked by admin",
  ADMIN_UPDATE_USER: "✏️ User data updated by admin",
  ADMIN_INVOICE_STATUS_CHANGE: "📄 Invoice status changed",
  TRAINER_CREATE_TERM: "📅 Training session created",
  TRAINER_CANCEL_TERM: "❌ Training session cancelled",
  TRAINER_RATE_CLIENT: "⭐ Client rated",
  TRAINER_CREATE_EXERCISE: "🏋️ Exercise created",
  TRAINER_DELETE_EXERCISE: "🗑️ Exercise deleted",
  TRAINER_CREATE_PROGRAM: "📋 Program created",
  TRAINER_ASSIGN_PROGRAM: "🔗 Program assigned to client",
  TRAINER_FINISH_WORKOUT: "✅ Workout session completed",
  TRAINER_UPDATE_PROFILE: "👤 Trainer profile updated",
  TRAINER_CREATE_CLIENT: "👥 Client account created by trainer",
  TRAINER_SELECT_PLAN: "💳 Plan selected",
  TRAINER_UPGRADE_PLAN: "⬆️ Plan upgraded",
  TRAINER_DOWNGRADE_PLAN: "⬇️ Plan downgraded",
  TRAINER_APPROVE_CLIENT_REQUEST: "✅ Client request approved",
  TRAINER_REJECT_CLIENT_REQUEST: "❌ Client request rejected",
  CLIENT_CHOOSE_TRAINER: "🤝 Client chose trainer",
  CLIENT_BOOK_TERM: "📅 Client booked session",
  CLIENT_CANCEL_TERM: "❌ Client cancelled booking",
  CLIENT_UPDATE_PROFILE: "👤 Client profile updated",
  CLIENT_SEND_TRAINER_REQUEST: "📨 Client sent trainer request",
  BACKOFFICE_BLOCK: "🔒 Blocked via Backoffice",
  BACKOFFICE_UNBLOCK: "🔓 Unblocked via Backoffice",
};

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function formatDetails(details: any): string | null {
  if (!details) return null;
  const d = typeof details === "string" ? JSON.parse(details) : details;

  const parts: string[] = [];

  if (d.clientEmail) parts.push(`Client: ${d.clientEmail}`);
  if (d.clientName) parts.push(`Name: ${d.clientName}`);
  if (d.newTrainerEmail) parts.push(`Email: ${d.newTrainerEmail}`);
  if (d.targetUserId) parts.push(`Target user ID: ${d.targetUserId}`);
  if (d.trainerId) parts.push(`Trainer ID: ${d.trainerId}`);
  if (d.clientId) parts.push(`Client ID: ${d.clientId}`);
  if (d.termId) parts.push(`Session ID: ${d.termId}`);
  if (d.sessionId) parts.push(`Workout ID: ${d.sessionId}`);
  if (d.programId) parts.push(`Program ID: ${d.programId}`);
  if (d.exerciseId) parts.push(`Exercise ID: ${d.exerciseId}`);
  if (d.name) parts.push(`Name: ${d.name}`);
  if (d.rating !== undefined) parts.push(`Rating: ${d.rating}/10`);
  if (d.planId) parts.push(`Plan ID: ${d.planId}`);
  if (d.newStatus) parts.push(`Status → ${d.newStatus}`);
  if (d.invoiceId) parts.push(`Invoice ID: ${d.invoiceId}`);
  if (d.type) parts.push(`Type: ${d.type}`);
  if (d.capacity) parts.push(`Capacity: ${d.capacity}`);
  if (d.startAt) parts.push(`At: ${new Date(d.startAt).toLocaleString()}`);
  if (d.ime || d.prezime) parts.push(`Name: ${d.ime ?? ""} ${d.prezime ?? ""}`.trim());
  if (d.pol) parts.push(`Gender: ${d.pol}`);
  if (d.blocked !== undefined) parts.push(`Blocked: ${d.blocked ? "Yes" : "No"}`);
  if (d.reason) parts.push(`Reason: ${d.reason}`);
  if (d.requestId) parts.push(`Request ID: ${d.requestId}`);

  return parts.length ? parts.join(" · ") : null;
}

function CatBadge({ c }: { c: AuditCategory }) {
  if (c === "Greška") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <XCircle className="w-3 h-3" /> Error
    </span>
  );
  if (c === "Upozorenje") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
      <AlertTriangle className="w-3 h-3" /> Warning
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      <Info className="w-3 h-3" /> Info
    </span>
  );
}

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
  }, [page, category]); // eslint-disable-line

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm text-black overflow-hidden">
      {/* Filter bar */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm">
            <Filter className="h-4 w-4" />
            Filter & Search
          </div>
          <div className="flex flex-1 gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition placeholder:text-gray-400 bg-white text-black"
                placeholder="Search action or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
              />
            </div>
            <select
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition bg-white text-black"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              <option value="Informacija">Info</option>
              <option value="Upozorenje">Warning</option>
              <option value="Greška">Error</option>
            </select>
            <button
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm transition"
              onClick={() => { setPage(1); load(); }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-400 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" /> Loading logs...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No logs found</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="p-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">Time</th>
                <th className="p-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Category</th>
                <th className="p-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Action</th>
                <th className="p-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">User</th>
                <th className="p-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((r) => {
                const details = formatDetails(r.details);
                return (
                  <tr key={r.id} className="hover:bg-yellow-50/40 transition group">
                    <td className="p-3 text-gray-500 text-xs whitespace-nowrap font-mono">
                      {new Date(r.createdAt).toLocaleString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", second: "2-digit"
                      })}
                    </td>
                    <td className="p-3">
                      <CatBadge c={r.category} />
                    </td>
                    <td className="p-3 font-medium text-gray-900 max-w-[260px]">
                      <span className="block">{formatAction(r.action)}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{r.action}</span>
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {r.username ? (
                        <span className="font-medium text-gray-900">{r.username}</span>
                      ) : r.userId ? (
                        <span className="text-gray-400 text-xs font-mono">ID #{r.userId}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 text-xs max-w-[300px]">
                      {details ?? <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
        <span className="text-sm text-gray-500">
          Page <span className="font-semibold text-gray-700">{page}</span> / {pages} &nbsp;·&nbsp; {total} total entries
        </span>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
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