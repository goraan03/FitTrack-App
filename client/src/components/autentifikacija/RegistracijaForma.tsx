// client/src/components/autentifikacija/RegistracijaForma.tsx
import { useEffect, useId, useState } from "react";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";

type Props = { authApi: IAuthAPIService };

export default function RegistracijaForma({ authApi }: Props) {
  const seed = useId().replace(/:/g, "_");

  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [age, setAge] = useState<string>("");
  const [pol, setPol] = useState<"musko" | "zensko">("musko");
  const [loading, setLoading] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  const { login } = useAuth();

  useEffect(() => {
    setIme(""); setPrezime(""); setEmail(""); setLozinka(""); setAge("");
  }, []);

  const toDob = (ageStr: string): string | undefined => {
    if (!ageStr) return undefined;
    const n = parseInt(ageStr, 10);
    if (!Number.isFinite(n) || n < 1 || n > 120) return undefined;
    const year = new Date().getFullYear() - n;
    return `${year}-01-01`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska(null);
    if (!ime || !prezime || !email || !lozinka) {
      setGreska("All fields except age are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setGreska("Please enter a valid email.");
      return;
    }
    if (lozinka.length < 6) {
      setGreska("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const odgovor = await authApi.registracija({
        korisnickoIme: email,
        lozinka,
        ime,
        prezime,
        datumRodjenja: toDob(age),
        pol,
      });
      if (odgovor.success && odgovor.data) {
        login(odgovor.data);
      } else {
        setGreska(odgovor.message || "Registration failed.");
      }
    } catch {
      setGreska("Error during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" autoComplete="off">
      <input className="hidden" type="text" name="username" autoComplete="email" />
      <input className="hidden" type="password" name="password" autoComplete="nova-lozinka" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ime</label>
          <input
            type="text"
            name={`fn_${seed}`}
            autoComplete="off"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            placeholder="Name"
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            name={`ln_${seed}`}
            autoComplete="off"
            value={prezime}
            onChange={(e) => setPrezime(e.target.value)}
            placeholder="Last Name"
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="text"
          name={`e_${seed}`}
          autoComplete="off"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          placeholder="Your email"
          required
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          name={`p_${seed}`}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          value={lozinka}
          onChange={(e) => setLozinka(e.target.value)}
          placeholder="Create password"
          required
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            min={1}
            max={120}
            name={`a_${seed}`}
            autoComplete="off"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name={`g_${seed}`}
            value={pol}
            onChange={(e) => setPol(e.target.value as "musko" | "zensko")}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
          >
            <option value="musko">Male</option>
            <option value="zensko">Female</option>
          </select>
        </div>
      </div>

      {greska && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{greska}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-200 transition disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}