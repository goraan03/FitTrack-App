import { useEffect, useMemo, useState } from "react";
import type { AuthFormProps } from "../../types/props/auth_form_props/AuthFormProps";
import { validacijaPodatakaAuth } from "../../api_services/validators/auth/AuthValidator";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { OtpInput } from "./OtpInput";
import { PročitajVrednostPoKljuču, SačuvajVrednostPoKljuču, ObrišiVrednostPoKljuču } from "../../helpers/local_storage";

type Phase = 'credentials' | 'code';

type TwoFAState = {
  challengeId: string;
  expiresAt: string; // ISO
  maskedEmail: string;
};

const TWO_FA_KEY = "twofa_state";

export function PrijavaForma({ authApi }: AuthFormProps) {
  const [korisnickoIme, setKorisnickoIme] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [prikazi, setPrikazi] = useState(false);
  const [greska, setGreska] = useState("");
  const [loading, setLoading] = useState(false);

  const [phase, setPhase] = useState<Phase>('credentials');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const { login } = useAuth();

  // učitaj TwoFA state iz localStorage (ako je korisnik reloadao stranicu)
  useEffect(() => {
    const raw = PročitajVrednostPoKljuču(TWO_FA_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw) as TwoFAState;
        if (s?.challengeId && s?.expiresAt) {
          setChallengeId(s.challengeId);
          setExpiresAt(s.expiresAt);
          setMaskedEmail(s.maskedEmail || null);
          setPhase('code');
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const secondsLeft = useMemo(() => {
    if (!expiresAt) return 0;
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => {
      setExpiresAt((prev) => (prev ? prev : null));
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const persistTwoFA = (s: TwoFAState) => {
    SačuvajVrednostPoKljuču(TWO_FA_KEY, JSON.stringify(s));
  };
  const clearTwoFA = () => {
    ObrišiVrednostPoKljuču(TWO_FA_KEY);
  };

  const podnesiKredencijale = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");

    const valid = validacijaPodatakaAuth(korisnickoIme, lozinka);
    if (!valid.uspesno) {
      setGreska(valid.poruka ?? "Неисправни подаци");
      return;
    }

    try {
      setLoading(true);
      const odgovor = await authApi.prijava(korisnickoIme, lozinka);
      if (odgovor.success && odgovor.data) {
        setChallengeId(odgovor.data.challengeId);
        setMaskedEmail(odgovor.data.maskedEmail);
        setExpiresAt(odgovor.data.expiresAt);
        setPhase('code');

        persistTwoFA({
          challengeId: odgovor.data.challengeId,
          expiresAt: odgovor.data.expiresAt,
          maskedEmail: odgovor.data.maskedEmail,
        });
      } else {
        setGreska(odgovor.message || "Neuspešna prijava");
      }
    } catch {
      setGreska("Greška prilikom prijave. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const podnesiKod = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");

    if (!challengeId) {
      setGreska("Nema aktivnog izazova. Pokušajte ponovo.");
      setPhase('credentials');
      clearTwoFA();
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setGreska("Kod mora imati tačno 6 cifara.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.verify2fa(challengeId, otp);
      if (res.success && res.data) {
        clearTwoFA();
        login(res.data);
      } else {
        // prikazi poruku sa servera (Expired / Already used / ...)
        setGreska(res.message || "Verifikacija neuspešna.");
      }
    } catch {
      setGreska("Greška prilikom verifikacije. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!challengeId) return;
    try {
      setLoading(true);
      const res = await authApi.resend2fa(challengeId);
      if (res.success && res.data) {
        setChallengeId(res.data.challengeId);
        setExpiresAt(res.data.expiresAt);
        setOtp("");

        persistTwoFA({
          challengeId: res.data.challengeId,
          expiresAt: res.data.expiresAt,
          maskedEmail: maskedEmail || "",
        });
      } else {
        setGreska(res.message || "Nije moguće poslati novi kod.");
      }
    } catch {
      setGreska("Greška pri slanju novog koda.");
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'credentials') {
    return (
      <form onSubmit={podnesiKredencijale} className="space-y-5" autoComplete="off">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email adresa</label>
          <input
            type="email"
            name="username"
            autoComplete="username"
            value={korisnickoIme}
            onChange={(e) => setKorisnickoIme(e.target.value.trim())}
            placeholder="Unesite email"
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
          <div className="relative">
            <input
              type={prikazi ? "text" : "password"}
              name="current-password"
              autoComplete="current-password"
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
              placeholder="Unesite lozinku"
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-11 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setPrikazi((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={prikazi ? "Sakrij lozinku" : "Prikaži lozinku"}
              tabIndex={-1}
            >
              {prikazi ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 4.64A9.77 9.77 0 0112 4c5 0 9 3.5 10 8a10.86 10.86 0 01-3.1 5.24M6.1 6.1A10.86 10.86 0 002 12a10.82 10.82 0 004.58 6.9M14.12 19.36A9.77 9.77 0 0112 20" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <circle cx="12" cy="12" r="3" strokeWidth={1.8} />
                </svg>
              )}
            </button>
          </div>
        </div>

        {greska && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{greska}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-200 transition disabled:opacity-60"
        >
          {loading ? "Prijavljivanje..." : "Prijavi se"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={podnesiKod} className="space-y-5" autoComplete="off">
      <div className="text-sm text-gray-700">
        Unesite 6-cifreni kod koji smo poslali na: <span className="font-semibold">{maskedEmail}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Verifikacioni kod</label>
        <OtpInput value={otp} onChange={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))} />
        <div className="mt-2 text-sm text-gray-600">
          {secondsLeft > 0 ? `Kod ističe za ${secondsLeft}s` : "Kod je istekao."}
        </div>
      </div>

      {greska && <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{greska}</div>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex justify-center items-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-200 transition disabled:opacity-60"
        >
          {loading ? "Provera..." : "Potvrdi kod"}
        </button>

        <button
          type="button"
          disabled={loading || secondsLeft > 0}
          onClick={resend}
          className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Pošalji novi kod
        </button>
      </div>

      <button
        type="button"
        className="text-sm text-gray-500 hover:text-gray-700 underline"
        onClick={() => { setPhase('credentials'); setOtp(""); setGreska(""); clearTwoFA(); }}
      >
        Vrati se na unos kredencijala
      </button>
    </form>
  );
}