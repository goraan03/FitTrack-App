import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import Brand from "../../components/common/Brand";

type Props = {
  authApi: IAuthAPIService;
};

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage({ authApi }: Props) {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    if (loading) return;

    if (step === "email") {
      navigate("/login");
      return;
    }

    if (step === "otp") {
      setOtp("");
      setChallengeId("");
      setStep("email");
      return;
    }

    // password -> otp
    setNewPassword("");
    setConfirmPassword("");
    setStep("otp");
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(trimmed);
      if (res.success && res.data?.challengeId) {
        setChallengeId(res.data.challengeId);
        setStep("otp");
        toast.success("Verification code sent to your email");
      } else {
        toast.error(res.message || "Failed to send code");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Error sending code");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!challengeId) {
      toast.error("Missing challenge. Please request a new code.");
      setStep("email");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Code must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyResetOtp(challengeId, otp);
      if (res.success) {
        setStep("password");
        toast.success("Code verified");
      } else {
        toast.error(res.message || "Invalid code");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!challengeId) {
      toast.error("Missing challenge. Please request a new code.");
      setStep("email");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(challengeId, newPassword);
      if (res.success) {
        toast.success("Password reset successfully");
        navigate("/login", { replace: true });
      } else {
        toast.error(res.message || "Reset failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  // shared styles (isto kao login card)
  const labelCls =
    "block mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-300";
  const inputCls =
    "w-full rounded-xl border border-[#27273a] bg-[#0a0a0f] px-4 py-3 text-white placeholder:text-slate-500 text-sm font-medium " +
    "focus:outline-none focus:ring-2 focus:ring-white/15 focus:border-white/15 transition";
  const primaryBtn =
    "w-full inline-flex justify-center items-center rounded-xl px-5 py-3 " +
    "bg-white text-black font-semibold text-sm uppercase tracking-wider " +
    "hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="px-4 sm:px-6 pt-16 pb-24">
        <div className="max-w-md mx-auto">
          {/* Brand */}
          <div className="mb-10 flex justify-center opacity-0 animate-fade-in-up">
            <Brand size="lg" />
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition opacity-0 animate-fade-in-up stagger-1"
            style={{ animationFillMode: "forwards" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Card */}
          <div
            className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]
                      overflow-hidden opacity-0 animate-fade-in-up stagger-2"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-black/30 border border-white/10 grid place-items-center text-amber-300">
                  <Lock className="w-5 h-5" />
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  FitTrack
                </div>

                <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide text-white">
                  {step === "email" && "Reset Password"}
                  {step === "otp" && "Verify Code"}
                  {step === "password" && "New Password"}
                </h1>

                <p className="text-slate-400 mt-2 text-sm">
                  {step === "email" && "Enter your email and we’ll send a verification code."}
                  {step === "otp" && "Enter the 6-digit code sent to your email."}
                  {step === "password" && "Choose a strong new password for your account."}
                </p>
              </div>

              {/* Tabs (isto kao login) */}
              <div className="grid grid-cols-2 gap-1 bg-black/30 border border-white/5 rounded-xl p-1 text-xs font-bold uppercase tracking-widest mb-6">
                <Link
                  to="/login"
                  className="text-center py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  Sign Up
                </Link>
              </div>

              {/* STEP: email */}
              {step === "email" && (
                <form onSubmit={sendCode} className="space-y-5" autoComplete="off">
                  <div>
                    <label className={labelCls}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                        className={`${inputCls} pl-11`}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading ? "Sending..." : "Send code"}
                  </button>
                </form>
              )}

              {/* STEP: otp */}
              {step === "otp" && (
                <form onSubmit={verifyOtp} className="space-y-5" autoComplete="off">
                  <div className="text-sm text-slate-300">
                    Enter the 6-digit code we sent to{" "}
                    <span className="font-semibold text-white">{email.trim()}</span>
                  </div>

                  <div>
                    <label className={labelCls}>Verification Code</label>
                    <OtpInput value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))} />
                  </div>

                  <button type="submit" disabled={loading || otp.length !== 6} className={primaryBtn}>
                    {loading ? "Verifying..." : "Confirm code"}
                  </button>

                  <button
                    type="button"
                    className="w-full text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white underline underline-offset-4"
                    onClick={() => {
                      if (loading) return;
                      setOtp("");
                      setStep("email");
                    }}
                  >
                    Use a different email
                  </button>
                </form>
              )}

              {/* STEP: password */}
              {step === "password" && (
                <form onSubmit={resetPassword} className="space-y-5" autoComplete="off">
                  <div>
                    <label className={labelCls}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className={inputCls}
                    />
                  </div>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm">
                      Passwords don't match
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !newPassword || newPassword !== confirmPassword}
                    className={primaryBtn}
                  >
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="mt-6 text-center text-sm text-slate-500 opacity-0 animate-fade-in-up stagger-3"
            style={{ animationFillMode: "forwards" }}
          >
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-white hover:text-slate-200 font-semibold underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

type OtpInputProps = {
  value: string;
  onChange: (val: string) => void;
  length?: number;
};

function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const vals = useMemo(
    () => value.padEnd(length, " ").slice(0, length).split(""),
    [value, length]
  );

  const focusAt = (idx: number) => {
    inputRefs.current[idx]?.focus();
  };

  const setChar = (idx: number, ch: string) => {
    const nextArr = vals.map((v) => (v === " " ? "" : v));
    nextArr[idx] = ch;

    const next = nextArr.join("").replace(/\s/g, "").slice(0, length);
    onChange(next);
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    if (!onlyDigits) {
      setChar(i, "");
      return;
    }

    setChar(i, onlyDigits[onlyDigits.length - 1]);
    if (i < length - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const cur = vals[i] === " " ? "" : vals[i];
      if (!cur && i > 0) {
        focusAt(i - 1);
      } else {
        setChar(i, "");
      }
      return;
    }

    if (e.key === "ArrowLeft" && i > 0) focusAt(i - 1);
    if (e.key === "ArrowRight" && i < length - 1) focusAt(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const clip = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!clip) return;

    onChange(clip);
    focusAt(Math.min(clip.length, length - 1));
  };

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`OTP digit ${i + 1}`}
          value={vals[i] === " " ? "" : vals[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="
            h-12 w-full
            rounded-xl
            border border-[#27273a]
            bg-black/30
            text-white
            text-center text-lg font-black
            shadow-[0_10px_30px_rgba(0,0,0,0.35)]
            placeholder:text-slate-600
            transition
            focus:outline-none
            focus:border-white/20
            focus:ring-2 focus:ring-white/10
          "
        />
      ))}
    </div>
  );
}