// client/src/pages/auth/RegistracijaStranica.tsx
import { Link } from "react-router-dom";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import RegistracijaForma from "../../components/autentifikacija/RegistracijaForma";
import Brand from "../../components/common/Brand";

type Props = { authApi: IAuthAPIService };

export default function RegistracijaStranica({ authApi }: Props) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-neutral-900 px-4 py-10 text-white">
      <div className="max-w-md mx-auto">
        {/* Brand */}
        <div className="mb-8 flex justify-center">
          <Brand size="lg" />
        </div>

        {/* Card */}
        <div className="bg-white/95 text-black backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-wide text-secondary">Welcome</h1>
            <p className="text-gray-600 mt-1">
              Sign in to your account or create a new one
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-gray-200 rounded-xl p-1 text-sm font-semibold mb-6">
            <Link
              to="/login"
              className="text-center py-2 rounded-lg text-gray-600 hover:text-black"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-center py-2 rounded-lg bg-yellow-400 text-black shadow-md"
            >
              Sign Up
            </Link>
          </div>

          {/* Register form */}
          <RegistracijaForma authApi={authApi} />
        </div>
      </div>
    </main>
  );
}