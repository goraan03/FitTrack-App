import { useId, useState, useEffect } from "react";
import type { IAdminAPIService } from "../../api_services/admin/IAdminAPIService";
import { UserPlus } from "lucide-react";

type Props = { adminApi: IAdminAPIService };

export default function CreateTrainerForm({ adminApi }: Props) {
  const seed = useId().replace(/:/g, "_");
  const [form, setForm] = useState({ korisnickoIme: "", lozinka: "", ime: "", prezime: "", datumRodjenja: "", pol: "musko" as "musko" | "zensko" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setForm({ korisnickoIme: "", lozinka: "", ime: "", prezime: "", datumRodjenja: "", pol: "musko" });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      setLoading(true);
      const res = await adminApi.createTrainer({
        korisnickoIme: form.korisnickoIme.trim(),
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
    <section className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6 sm:p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Kreiranje trenera</h3>
          <p className="text-gray-600 text-sm">Dodajte novog trenera u sistem</p>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-5" autoComplete="off">
        <input className="hidden" type="text" name="username" autoComplete="username" />
        <input className="hidden" type="password" name="password" autoComplete="new-password" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Ime</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              autoComplete="off"
              name={`fn_${seed}`}
              value={form.ime}
              onChange={(e) => setForm({ ...form, ime: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Prezime</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              autoComplete="off"
              name={`ln_${seed}`}
              value={form.prezime}
              onChange={(e) => setForm({ ...form, prezime: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700">Email (korisničko ime)</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            type="text"
            name={`em_${seed}`}
            autoComplete="off"
            inputMode="email"
            value={form.korisnickoIme}
            onChange={(e) => setForm({ ...form, korisnickoIme: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-700">Lozinka</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            type="password"
            name={`pw_${seed}`}
            autoComplete="new-password"
            value={form.lozinka}
            onChange={(e) => setForm({ ...form, lozinka: e.target.value })}
            required
            minLength={6}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700">Datum rođenja (opciono)</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              type="date"
              name={`dob_${seed}`}
              autoComplete="off"
              value={form.datumRodjenja}
              onChange={(e) => setForm({ ...form, datumRodjenja: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Pol</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              value={form.pol}
              onChange={(e) => setForm({ ...form, pol: e.target.value as "musko" | "zensko" })}
            >
              <option value="musko">Muško</option>
              <option value="zensko">Žensko</option>
            </select>
          </div>
        </div>

        {msg && <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm">{msg}</div>}
        {err && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{err}</div>}

        <div className="flex justify-end">
          <button
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
          >
            {loading ? "Kreiranje..." : "Kreiraj trenera"}
          </button>
        </div>
      </form>
    </section>
  );
}