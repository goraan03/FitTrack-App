import { useEffect, useMemo, useState, useId } from "react";
import type { AuthFormProps } from "../../types/props/auth_form_props/AuthFormProps";
import { validacijaPodatakaAuth } from "../../api_services/validators/auth/AuthValidator";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { OtpInput } from "./OtpInput";
import {
  PročitajVrednostPoKljuču,
  SačuvajVrednostPoKljuču,
  ObrišiVrednostPoKljuču,
} from "../../helpers/localStorage/local_storage";
import type { Phase } from "../../types/auth/Phase";
import type { TwoFAState } from "../../types/auth/TwoFAState";

const TWO_FA_KEY = "twofa_state";

export function PrijavaForma({ authApi }: AuthFormProps) {
  const seed = useId().replace(/:/g, "_");

  const [korisnickoIme, setKorisnickoIme] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [prikazi, setPrikazi] = useState(false);
  const [greska, setGreska] = useState("");
  const [loading, setLoading] = useState(false);

  const [phase, setPhase] = useState<Phase>("credentials");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const [now, setNow] = useState<number>(Date.now());

  const { login } = useAuth();

  useEffect(() => {
    setKorisnickoIme("");
    setLozinka("");
  }, []);

  useEffect(() => {
    const raw = PročitajVrednostPoKljuču(TWO_FA_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw) as TwoFAState;
        if (s?.challengeId && s?.expiresAt) {
          setChallengeId(s.challengeId);
          setExpiresAt(s.expiresAt);
          setMaskedEmail(s.maskedEmail || null);
          setPhase("code");
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const secondsLeft = useMemo(() => {
    if (!expiresAt) return 0;
    const diff = Math.floor((new Date(expiresAt).getTime() - now) / 1000);
    return Math.max(0, diff);
  }, [expiresAt, now]);

  const persistTwoFA = (s: TwoFAState) =>
    SačuvajVrednostPoKljuču(TWO_FA_KEY, JSON.stringify(s));
  const clearTwoFA = () => ObrišiVrednostPoKljuču(TWO_FA_KEY);

  const podnesiKredencijale = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");

    const valid = validacijaPodatakaAuth(korisnickoIme, lozinka);
    if (!valid.uspesno) {
      setGreska(valid.poruka ?? "Credentials not valid");
      return;
    }

    try {
      setLoading(true);
      const odgovor = await authApi.prijava(korisnickoIme, lozinka);
      if (odgovor.success && odgovor.data) {
        setChallengeId(odgovor.data.challengeId);
        setMaskedEmail(odgovor.data.maskedEmail);
        setExpiresAt(odgovor.data.expiresAt);
        setPhase("code");
        persistTwoFA({
          challengeId: odgovor.data.challengeId,
          expiresAt: odgovor.data.expiresAt,
          maskedEmail: odgovor.data.maskedEmail,
        });
      } else {
        setGreska(odgovor.message || "Login failed");
      }
    } catch {
      setGreska("Error during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const podnesiKod = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");

    if (!challengeId) {
      setGreska("No active challenge. Please try again.");
      setPhase("credentials");
      clearTwoFA();
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setGreska("Code must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.verify2fa(challengeId, otp);
      if (res.success && res.data) {
        clearTwoFA();
        login(res.data);
      } else {
        setGreska(res.message || "Verification failed.");
      }
    } catch {
      setGreska("Error during verification. Please try again.");
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
        setGreska(res.message || "Unable to resend code.");
      }
    } catch {
      setGreska("Error while resending code.");
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
  const softBtn =
    "inline-flex justify-center items-center rounded-xl px-4 py-3 " +
    "border border-white/10 bg-white/5 text-white/80 text-xs font-bold uppercase tracking-wider " +
    "hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed";

  if (phase === "credentials") {
    return (
      <form onSubmit={podnesiKredencijale} className="space-y-5" autoComplete="off">
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="text"
            name={`u_${seed}`}
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={korisnickoIme}
            onChange={(e) => setKorisnickoIme(e.target.value.trim())}
            placeholder="Enter email"
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Password</label>
          <div className="relative">
            <input
              type={prikazi ? "text" : "password"}
              name={`p_${seed}`}
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
              placeholder="Enter password"
              required
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setPrikazi((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition"
              aria-label={prikazi ? "Hide password" : "Show password"}
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

        {greska && <div className={errorCls}>{greska}</div>}

        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={podnesiKod} className="space-y-5" autoComplete="off">
      <div className="text-sm text-slate-300">
        Enter the 6-digit code sent to{" "}
        <span className="font-semibold text-white">{maskedEmail}</span>
      </div>

      <div>
        <label className={labelCls}>Verification Code</label>
        <OtpInput value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))} />
        <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {secondsLeft > 0 ? `Code expires in ${secondsLeft}s` : "Code has expired."}
        </div>
      </div>

      {greska && <div className={errorCls}>{greska}</div>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="flex-1 w-full rounded-xl px-5 py-3 bg-white text-black font-semibold text-sm uppercase tracking-wider hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Verifying..." : "Confirm Code"}
        </button>

        <button type="button" disabled={loading || secondsLeft > 0} onClick={resend} className={softBtn}>
          Resend
        </button>
      </div>

      <button
        type="button"
        className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white underline underline-offset-4"
        onClick={() => {
          setPhase("credentials");
          setOtp("");
          setGreska("");
          clearTwoFA();
        }}
      >
        Back to credentials
      </button>
    </form>
  );
}