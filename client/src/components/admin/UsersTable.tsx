import { useEffect, useMemo, useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import type { AdminUser } from "../../types/admin/AdminUser";
import { RefreshCcw } from "lucide-react";

type Props = { adminApi: IAdminAPIService };

export default function UsersTable({ adminApi }: Props) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [role, setRole] = useState<"svi" | "klijent" | "trener" | "admin">("svi");
  const [blocked, setBlocked] = useState<"svi" | "da" | "ne">("svi");
  const [, setError] = useState<string | null>(null);

  const filtered = useMemo(() => users, [users]);

  const fetchUsers = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        uloga: role === "svi" ? undefined : role,
        blokiran: blocked === "svi" ? undefined : blocked === "da",
      });
      if (res.success && res.data) setUsers(res.data);
      else setError(res.message || "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, blocked]); // eslint-disable-line

  const toggleBlock = async (u: AdminUser) => {
    const res = await adminApi.setBlocked(u.id, !u.blokiran);
    if (res.success) fetchUsers();
  };

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editState, setEditState] = useState({
    ime: "",
    prezime: "",
    datumRodjenja: "",
    pol: "musko" as "musko" | "zensko",
  });
  const [editErr, setEditErr] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditState({
      ime: u.ime,
      prezime: u.prezime,
      datumRodjenja: u.datumRodjenja || "",
      pol: (u.pol || "musko") as "musko" | "zensko",
    });
    setEditErr(null);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setEditLoading(true);
    setEditErr(null);
    const res = await adminApi.updateUser(editUser.id, {
      ime: editState.ime,
      prezime: editState.prezime,
      datumRodjenja: editState.datumRodjenja || null,
      pol: editState.pol,
    });
    setEditLoading(false);
    if (res.success) {
      setEditUser(null);
      fetchUsers();
    } else {
      setEditErr(res.message || "Greška pri čuvanju.");
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 shadow-sm text-black">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Users</h3>
          <p className="text-sm text-gray-600">Overview and management of client and trainer accounts</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Role</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="svi">All</option>
              <option value="klijent">Clients</option>
              <option value="trener">Trainers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Status</label>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              value={blocked}
              onChange={(e) => setBlocked(e.target.value as any)}
            >
              <option value="svi">All</option>
              <option value="da">Only Blocked</option>
              <option value="ne">Only Active</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1">Actions</label>
            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-yellow-400 text-yellow-700 hover:bg-yellow-400/10 font-semibold disabled:opacity-60 transition"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-3 text-gray-700">ID</th>
              <th className="p-3 text-gray-700">Email</th>
              <th className="p-3 text-gray-700">Role</th>
              <th className="p-3 text-gray-700">First Name</th>
              <th className="p-3 text-gray-700">Last Name</th>
              <th className="p-3 text-gray-700">Date of Birth</th>
              <th className="p-3 text-gray-700">Gender</th>
              <th className="p-3 text-gray-700">Status</th>
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
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-500" colSpan={9}>
                  No results found
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50/70 transition">
                  <td className="p-3 text-gray-800">{u.id}</td>
                  <td className="p-3 text-gray-800">{u.korisnickoIme}</td>
                  <td className="p-3 text-gray-800">{u.uloga}</td>
                  <td className="p-3 text-gray-800">{u.ime}</td>
                  <td className="p-3 text-gray-800">{u.prezime}</td>
                  <td className="p-3 text-gray-800">{u.datumRodjenja || "-"}</td>
                  <td className="p-3 text-gray-800">{u.pol || "-"}</td>
                  <td className="p-3">
                    {u.blokiran ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-rose-100 text-rose-700 border border-rose-200">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleBlock(u)}
                      className={`px-3 py-1 rounded-lg text-white transition ${
                        u.blokiran ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      {u.blokiran ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-lg border border-gray-100 text-black">
            <h4 className="text-lg font-semibold mb-4 text-gray-900">
              Edit User #{editUser.id}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                  value={editState.ime}
                  onChange={(e) => setEditState({ ...editState, ime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Surname
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                  value={editState.prezime}
                  onChange={(e) => setEditState({ ...editState, prezime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                  value={editState.datumRodjenja}
                  onChange={(e) => setEditState({ ...editState, datumRodjenja: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                  value={editState.pol}
                  onChange={(e) => setEditState({ ...editState, pol: e.target.value as "musko" | "zensko" })}
                >
                  <option value="musko">Male</option>
                  <option value="zensko">Female</option>
                </select>
              </div>
            </div>

            {editErr && (
              <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm my-4">
                {editErr}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>
              <button
                disabled={editLoading}
                className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-400/90 text-black font-semibold shadow-sm disabled:opacity-60 transition"
                onClick={saveEdit}
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}