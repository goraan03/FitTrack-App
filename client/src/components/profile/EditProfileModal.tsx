import { useEffect, useMemo, useState } from "react";
import { X, Save, KeyRound } from "lucide-react";

export type EditProfileValues = {
  firstName: string;
  lastName: string;
  gender: "musko" | "zensko" | null;
  birthDateISO: string; // "YYYY-MM-DD" ili "" (prazno)
  address?: string;     // opcionalno, ako hoćeš da ga prikazuješ
};

export default function EditProfileModal(props: {
  open: boolean;
  title: string;
  loading?: boolean;
  error?: string | null;
  initial: EditProfileValues;
  onClose: () => void;
  onSave: (v: EditProfileValues) => void | Promise<void>;
  onChangePassword: () => void;
}) {
  const { open, title, loading, error, initial, onClose, onSave, onChangePassword } = props;

  const [v, setV] = useState<EditProfileValues>(initial);

  useEffect(() => {
    if (open) setV(initial);
  }, [open, initial]);

  const canSave = useMemo(() => {
    const fn = v.firstName.trim();
    const ln = v.lastName.trim();
    return fn.length >= 2 && ln.length >= 2 && (v.gender === "musko" || v.gender === "zensko");
  }, [v]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div
          className="
            w-full max-w-xl
            bg-[#111118] border border-[#27273a]
            rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#27273a]">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">
                Profile
              </p>
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {error ? (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-rose-300 text-sm font-semibold">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  First name
                </span>
                <input
                  value={v.firstName}
                  onChange={(e) => setV((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3 text-white outline-none focus:border-amber-400/40"
                  placeholder="Enter first name"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Last name
                </span>
                <input
                  value={v.lastName}
                  onChange={(e) => setV((p) => ({ ...p, lastName: e.target.value }))}
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3 text-white outline-none focus:border-amber-400/40"
                  placeholder="Enter last name"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Gender
                </span>
                <select
                  value={v.gender ?? ""}
                  onChange={(e) =>
                    setV((p) => ({
                      ...p,
                      gender: (e.target.value === "musko" || e.target.value === "zensko")
                        ? (e.target.value as any)
                        : null,
                    }))
                  }
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3 text-white outline-none focus:border-amber-400/40"
                >
                  <option value="">Select…</option>
                  <option value="musko">Muško</option>
                  <option value="zensko">Žensko</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Date of birth
                </span>
                <input
                  type="date"
                  value={v.birthDateISO}
                  onChange={(e) => setV((p) => ({ ...p, birthDateISO: e.target.value }))}
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#27273a] px-4 py-3 text-white outline-none focus:border-amber-400/40"
                />
              </label>
            </div>

            <div className="pt-1">
              <button
                onClick={onChangePassword}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-semibold transition"
              >
                <KeyRound className="w-4 h-4 text-amber-300" />
                Reset / Change password
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-[#27273a] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-semibold transition"
              disabled={!!loading}
            >
              Cancel
            </button>

            <button
              onClick={() => onSave({ ...v, firstName: v.firstName.trim(), lastName: v.lastName.trim() })}
              disabled={!canSave || !!loading}
              className="
                px-5 py-3 rounded-xl
                bg-amber-400/15 hover:bg-amber-400/20 border border-amber-400/25
                text-amber-200 text-sm font-semibold
                transition flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}