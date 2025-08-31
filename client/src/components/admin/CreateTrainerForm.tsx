import { useState } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";

type Props = { adminApi: IAdminAPIService };

export default function CreateTrainerForm({ adminApi }: Props) {
  const [form, setForm] = useState({
    korisnickoIme: "",
    lozinka: "",
    ime: "",
    prezime: "",
    datumRodjenja: "",
    pol: "musko" as "musko" | "zensko",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      setLoading(true);
      const res = await adminApi.createTrainer({
        korisnickoIme: form.korisnickoIme,
        lozinka: form.lozinka,
        ime: form.ime,
        prezime: form.prezime,
        datumRodjenja: form.datumRodjenja || undefined,
        pol: form.pol,
      });
      if (res.success) {
        setMsg(`Trener kreiran (ID: ${res.data?.id ?? "?"})`);
        setForm({ korisnickoIme: "", lozinka: "", ime: "", prezime: "", datumRodjenja: "", pol: "musko" });
      } else setErr(res.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 bg-white border rounded-xl p-5 shadow-sm" autoComplete="off">
      {/* Dummy inputs za “zavaravanje” password manager-a */}
      <input type="text" name="fake-username" autoComplete="username" className="hidden opacity-0 pointer-events-none" />
      <input type="password" name="fake-password" autoComplete="current-password" className="hidden opacity-0 pointer-events-none" />

      <h3 className="text-lg font-semibold">Kreiranje trenera</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700">Email (korisničko ime)</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            type="email"
            name="new-email"
            autoComplete="off"
            value={form.korisnickoIme}
            onChange={e => setForm({ ...form, korisnickoIme: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Lozinka</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            type="password"
            name="new-password"
            autoComplete="new-password"
            value={form.lozinka}
            onChange={e => setForm({ ...form, lozinka: e.target.value })}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Ime</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="off"
            value={form.ime}
            onChange={e => setForm({ ...form, ime: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Prezime</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="off"
            value={form.prezime}
            onChange={e => setForm({ ...form, prezime: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Datum rođenja (opciono)</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            type="date"
            autoComplete="off"
            value={form.datumRodjenja}
            onChange={e => setForm({ ...form, datumRodjenja: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Pol</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.pol}
            onChange={e => setForm({ ...form, pol: e.target.value as "musko" | "zensko" })}
          >
            <option value="musko">Muško</option>
            <option value="zensko">Žensko</option>
          </select>
        </div>
      </div>

      {msg && <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">{msg}</div>}
      {err && <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">{err}</div>}

      <button disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
        {loading ? "Kreiranje..." : "Kreiraj trenera"}
      </button>
    </form>
  );
}