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

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, blocked]);

  const toggleBlock = async (u: AdminUser) => {
    const res = await adminApi.setBlocked(u.id, !u.blokiran);
    if (res.success) fetchUsers();
  };

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
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold">Korisnici</h3>
        <div className="flex gap-3">
          <div>
            <label className="text-xs text-gray-500 block">Uloga</label>
            <select className="border rounded-lg px-3 py-2" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="svi">Svi</option>
              <option value="klijent">Klijenti</option>
              <option value="trener">Treneri</option>
              <option value="admin">Admini</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block">Blokirani</label>
            <select className="border rounded-lg px-3 py-2" value={blocked} onChange={e => setBlocked(e.target.value as any)}>
              <option value="svi">Svi</option>
              <option value="da">Samo blokirani</option>
              <option value="ne">Samo neblokirani</option>
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
              <th className="p-2">ID</th>
              <th className="p-2">Email</th>
              <th className="p-2">Uloga</th>
              <th className="p-2">Ime</th>
              <th className="p-2">Prezime</th>
              <th className="p-2">Datum rođenja</th>
              <th className="p-2">Pol</th>
              <th className="p-2">Status</th>
              <th className="p-2">Akcije</th>
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
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.korisnickoIme}</td>
                  <td className="p-2">{u.uloga}</td>
                  <td className="p-2">{u.ime}</td>
                  <td className="p-2">{u.prezime}</td>
                  <td className="p-2">{u.datumRodjenja || "-"}</td>
                  <td className="p-2">{u.pol || "-"}</td>
                  <td className="p-2">
                    {u.blokiran ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Blokiran</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Aktivan</span>
                    )}
                  </td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => openEdit(u)} className="px-3 py-1 rounded-md border">Uredi</button>
                    <button
                      onClick={() => toggleBlock(u)}
                      className={`px-3 py-1 rounded-md ${u.blokiran ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
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
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h4 className="text-lg font-semibold mb-4">Uredi korisnika #{editUser.id}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Ime</label>
                <input className="w-full border rounded-lg px-3 py-2" value={editState.ime}
                       onChange={e => setEditState({ ...editState, ime: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Prezime</label>
                <input className="w-full border rounded-lg px-3 py-2" value={editState.prezime}
                       onChange={e => setEditState({ ...editState, prezime: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Datum rođenja</label>
                <input className="w-full border rounded-lg px-3 py-2" type="date" value={editState.datumRodjenja}
                       onChange={e => setEditState({ ...editState, datumRodjenja: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Pol</label>
                <select className="w-full border rounded-lg px-3 py-2" value={editState.pol}
                        onChange={e => setEditState({ ...editState, pol: e.target.value as "musko" | "zensko" })}>
                  <option value="musko">Muško</option>
                  <option value="zensko">Žensko</option>
                </select>
              </div>
            </div>

            {editErr && <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm my-3">{editErr}</div>}

            <div className="mt-4 flex items-center gap-3 justify-end">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setEditUser(null)}>Otkaži</button>
              <button disabled={editLoading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white" onClick={saveEdit}>
                {editLoading ? "Čuvanje..." : "Sačuvaj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}