import { useEffect, useId, useState } from "react";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
        await login(odgovor.data);
        navigate("/app", { replace: true });
      } else {
        setGreska(odgovor.message || "Registration failed.");
      }
    } catch {
      setGreska("Error during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelCls =
    "block mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-300";
  const inputCls =
    "w-full rounded-xl border border-[#27273a] bg-[#0a0a0f] px-4 py-3 text-white placeholder:text-slate-500 text-sm font-medium " +
    "focus:outline-none focus:ring-2 focus:ring-white/15 focus:border-white/15 transition";
  const errorCls =
    "rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm";
  const primaryBtn =
    "w-full inline-flex justify-center items-center rounded-xl px-5 py-3 " +
    "bg-white text-black font-semibold text-sm uppercase tracking-wider " +
    "hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed";
  const selectCls =
    "w-full rounded-xl border border-[#27273a] bg-[#0a0a0f] px-4 py-3 text-white text-sm font-medium " +
    "focus:outline-none focus:ring-2 focus:ring-white/15 focus:border-white/15 transition appearance-none cursor-pointer";

  return (
    <form onSubmit={submit} className="space-y-5" autoComplete="off">
      <input className="hidden" type="text" name="username" autoComplete="email" />
      <input className="hidden" type="password" name="password" autoComplete="new-password" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>First Name</label>
          <input
            type="text"
            name={`fn_${seed}`}
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            placeholder="Name"
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Last Name</label>
          <input
            type="text"
            name={`ln_${seed}`}
            value={prezime}
            onChange={(e) => setPrezime(e.target.value)}
            placeholder="Last Name"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input
          type="text"
          name={`e_${seed}`}
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          placeholder="Your email"
          required
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Password</label>
        <input
          type="password"
          name={`p_${seed}`}
          value={lozinka}
          onChange={(e) => setLozinka(e.target.value)}
          placeholder="Create password"
          required
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Age</label>
          <input
            type="number"
            min={1}
            max={120}
            name={`a_${seed}`}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Gender</label>
          <select
            name={`g_${seed}`}
            value={pol}
            onChange={(e) => setPol(e.target.value as "musko" | "zensko")}
            className={selectCls}
          >
            <option value="musko">Male</option>
            <option value="zensko">Female</option>
          </select>
        </div>
      </div>

      {greska && <div className={errorCls}>{greska}</div>}

      <button type="submit" disabled={loading} className={primaryBtn}>
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}