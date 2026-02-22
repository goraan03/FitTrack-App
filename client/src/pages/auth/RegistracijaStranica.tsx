// client/src/pages/auth/RegistracijaStranica.tsx
import { Link } from "react-router-dom";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import RegistracijaForma from "../../components/autentifikacija/RegistracijaForma";
import Brand from "../../components/common/Brand";

type Props = { authApi: IAuthAPIService };

export default function RegistracijaStranica({ authApi }: Props) {
  return (
  <main className="min-h-screen bg-[#0a0a0f] text-white">
    <div className="px-4 sm:px-6 pt-16 pb-24">
      <div className="max-w-md mx-auto">
        {/* Brand */}
        <div className="mb-10 flex justify-center opacity-0 animate-fade-in-up">
          <Brand size="lg" />
        </div>

        {/* Card */}
        <div
          className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]
                    overflow-hidden opacity-0 animate-fade-in-up stagger-1"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                FitTrack
              </div>
              <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide text-white">
                Create Account
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                Create your account and start tracking progress
              </p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-black/30 border border-white/5 rounded-xl p-1 text-xs font-bold uppercase tracking-widest mb-6">
              <Link
                to="/login"
                className="text-center py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-center py-2.5 rounded-lg bg-white/10 text-white border border-white/10"
              >
                Sign Up
              </Link>
            </div>

            {/* Form */}
            <RegistracijaForma authApi={authApi} />
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-6 text-center text-sm text-slate-500 opacity-0 animate-fade-in-up stagger-2"
          style={{ animationFillMode: "forwards" }}
        >
          Already have an account?{" "}
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