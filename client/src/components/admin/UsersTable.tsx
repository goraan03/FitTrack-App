import { useEffect, useMemo, useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import type { AdminUser } from "../../types/admin/AdminUser";

type Props = { adminApi: IAdminAPIService };

export default function UsersTable({ adminApi }: Props) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [role, setRole] = useState<'svi' | 'klijent' | 'trener' | 'admin'>('svi');
  const [blocked, setBlocked] = useState<'svi' | 'da' | 'ne'>('svi');
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => users, [users]);

  const fetchUsers = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        uloga: role === 'svi' ? undefined : role,
        blokiran: blocked === 'svi' ? undefined : blocked === 'da'
      });
      if (res.success && res.data) setUsers(res.data);
      else setError(res.message || "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, [role, blocked]);

  const toggleBlock = async (u: AdminUser) => {
    const res = await adminApi.setBlocked(u.id, !u.blokiran);
    if (res.success) fetchUsers();
  };

  // Edit modal state
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editState, setEditState] = useState({ ime: "", prezime: "", datumRodjenja: "", pol: "musko" as "musko" | "zensko" });
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
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Korisnici</h3>
          <p className="text-sm text-gray-600">Pregled i upravljanje nalozima klijenata i trenera</p>
        </div>
        <div className="flex gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Uloga</label>
            <select className="border rounded-lg px-3 py-2" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="svi">Svi</option>
              <option value="klijent">Klijenti</option>
              <option value="trener">Treneri</option>
              <option value="admin">Admini</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select className="border rounded-lg px-3 py-2" value={blocked} onChange={e => setBlocked(e.target.value as any)}>
              <option value="svi">Svi</option>
              <option value="da">Samo blokirani</option>
              <option value="ne">Samo aktivni</option>
            </select>
          </div>
          <button onClick={fetchUsers} className="px-4 py-2 rounded-lg border">Osveži</button>
        </div>
      </div>

      {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm mb-3">{error}</div>}

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-3">ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Uloga</th>
              <th className="p-3">Ime</th>
              <th className="p-3">Prezime</th>
              <th className="p-3">Datum rođenja</th>
              <th className="p-3">Pol</th>
              <th className="p-3">Status</th>
              <th className="p-3">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={9}>Učitavanje...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-3" colSpan={9}>Nema rezultata</td></tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.korisnickoIme}</td>
                  <td className="p-3">{u.uloga}</td>
                  <td className="p-3">{u.ime}</td>
                  <td className="p-3">{u.prezime}</td>
                  <td className="p-3">{u.datumRodjenja || "-"}</td>
                  <td className="p-3">{u.pol || "-"}</td>
                  <td className="p-3">
                    {u.blokiran ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Blokiran</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">Aktivan</span>
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => openEdit(u)} className="px-3 py-1 rounded-lg border hover:bg-gray-50">Uredi</button>
                    <button
                      onClick={() => toggleBlock(u)}
                      className={`px-3 py-1 rounded-lg text-white ${u.blokiran ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {u.blokiran ? 'Odblokiraj' : 'Blokiraj'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h4 className="text-lg font-semibold mb-4">Uredi korisnika #{editUser.id}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Ime</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
                  value={editState.ime}
                  onChange={(e) => setEditState({ ...editState, ime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Prezime</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
                  value={editState.prezime}
                  onChange={(e) => setEditState({ ...editState, prezime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Datum rođenja</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
                  value={editState.datumRodjenja}
                  onChange={(e) => setEditState({ ...editState, datumRodjenja: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Pol</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
                  value={editState.pol}
                  onChange={(e) => setEditState({ ...editState, pol: e.target.value as "musko" | "zensko" })}
                >
                  <option value="musko">Muško</option>
                  <option value="zensko">Žensko</option>
                </select>
              </div>
            </div>

            {editErr && <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm my-4">{editErr}</div>}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button className="px-4 py-2 rounded-lg border hover:bg-gray-50" onClick={() => setEditUser(null)}>
                Otkaži
              </button>
              <button
                disabled={editLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm disabled:opacity-60"
                onClick={saveEdit}
              >
                {editLoading ? "Čuvanje..." : "Sačuvaj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}