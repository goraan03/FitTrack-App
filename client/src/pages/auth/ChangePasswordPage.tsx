import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { jwtDecode } from "jwt-decode";
import { KeyRound, Mail, ShieldCheck, Lock, ArrowLeft } from "lucide-react";

type JwtPayload = { korisnickoIme?: string };

export default function ChangePasswordPage({
  authApi,
  redirectAfter,
}: {
  authApi: IAuthAPIService;
  redirectAfter: string;
}) {
  const nav = useNavigate();

  const tokenEmail = useMemo(() => {
    try {
      const t = localStorage.getItem("token");
      if (!t) return "";
      const decoded = jwtDecode<JwtPayload>(t);
      return decoded?.korisnickoIme || "";
    } catch {
      return "";
    }
  }, []);

  // steps:
  // 1) request otp -> challengeId
  // 2) verify otp
  // 3) reset password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState(tokenEmail);
  const [challengeId, setChallengeId] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  const canRequest = email.trim().length > 3;
  const canVerify = challengeId.trim() && otp.trim().length >= 4;
  const canReset =
    challengeId.trim() &&
    newPassword.length >= 8 &&
    newPassword2.length >= 8 &&
    newPassword === newPassword2;

  async function requestOtp() {
    if (!canRequest) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      // backend ti vraća {success, message, data?} - mi hvatamo challengeId ako postoji
      const cid = res?.data?.challengeId || res?.challengeId || "";
      if (cid) setChallengeId(String(cid));
      setStep(2);
      toast.success(res?.message || "Kod je poslat na email.");
    } catch (e: any) {
      toast.error(e?.message || "Greška pri slanju koda.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!canVerify) return;
    setLoading(true);
    try {
      const res = await authApi.verifyResetOtp(challengeId, otp.trim());
      if (res?.success === false) {
        toast.error(res?.message || "Verifikacija nije uspela.");
        return;
      }
      toast.success(res?.message || "Kod verifikovan.");
      setStep(3);
    } catch (e: any) {
      toast.error(e?.message || "Greška pri verifikaciji.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPass() {
    if (!canReset) return;
    setLoading(true);
    try {
      const res = await authApi.resetPassword(challengeId, newPassword);
      if (res?.success === false) {
        toast.error(res?.message || "Reset nije uspeo.");
        return;
      }
      toast.success(res?.message || "Lozinka je promenjena.");
      nav(redirectAfter, { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "Greška pri resetu lozinke.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => nav(-1)}
          className="mb-6 inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[#27273a]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/15 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                  Security
                </p>
                <h1 className="text-xl sm:text-2xl font-bold">Change password</h1>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-widest">
              <span className={step >= 1 ? "text-amber-300" : ""}>1. Request</span>
              <span>•</span>
              <span className={step >= 2 ? "text-amber-300" : ""}>2. Verify</span>
              <span>•</span>
              <span className={step >= 3 ? "text-amber-300" : ""}>3. Reset</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Email
                  </label>
                  <div className="flex items-center gap-3 rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Poslaćemo OTP kod na ovaj email.
                  </p>
                </div>

                <button
                  disabled={!canRequest || loading}
                  onClick={requestOtp}
                  className="
                    w-full rounded-xl px-5 py-3
                    bg-amber-400 text-black font-bold
                    hover:bg-amber-300 transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="rounded-xl border border-[#27273a] bg-[#0a0a0f] p-4">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                    Challenge ID
                  </p>
                  <p className="mt-1 text-sm text-white font-bold break-all">{challengeId || "—"}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    OTP code
                  </label>
                  <div className="flex items-center gap-3 rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder:text-slate-600 tracking-widest"
                      placeholder="______"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Unesi 6-cifreni kod sa emaila.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="
                      w-full rounded-xl px-5 py-3
                      bg-white/5 hover:bg-white/10 border border-white/5
                      text-white font-semibold transition
                    "
                  >
                    Back
                  </button>
                  <button
                    disabled={!canVerify || loading}
                    onClick={verifyOtp}
                    className="
                      w-full rounded-xl px-5 py-3
                      bg-amber-400 text-black font-bold
                      hover:bg-amber-300 transition
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    New password
                  </label>
                  <div className="flex items-center gap-3 rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    Repeat new password
                  </label>
                  <div className="flex items-center gap-3 rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={newPassword2}
                      onChange={(e) => setNewPassword2(e.target.value)}
                      className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                      placeholder="Repeat"
                      autoComplete="new-password"
                    />
                  </div>
                  {newPassword2 && newPassword !== newPassword2 ? (
                    <p className="text-xs text-rose-300 font-semibold">
                      Lozinke se ne poklapaju.
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="
                      w-full rounded-xl px-5 py-3
                      bg-white/5 hover:bg-white/10 border border-white/5
                      text-white font-semibold transition
                    "
                  >
                    Back
                  </button>

                  <button
                    disabled={!canReset || loading}
                    onClick={resetPass}
                    className="
                      w-full rounded-xl px-5 py-3
                      bg-amber-400 text-black font-bold
                      hover:bg-amber-300 transition
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    {loading ? "Saving..." : "Save new password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}