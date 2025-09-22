import { useState } from "react";

type Participant = { userId: number; userName: string; rating?: number };
type Props = {
  open: boolean;
  programTitle?: string;
  participants: Participant[];
  onClose: () => void;
  onSubmit: (ratings: { userId: number; rating: number }[]) => Promise<void>;
};

export default function RateTermModal({ open, programTitle, participants, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const setR = (userId: number, r: number) => setValues(v => ({ ...v, [userId]: r }));

  const submit = async () => {
    setError(null);
    const list = Object.entries(values)
      .map(([k, v]) => ({ userId: Number(k), rating: Number(v) }))
      .filter(x => x.rating >= 1 && x.rating <= 10);
    if (list.length === 0) { setError("Enter at least one rating (1–10)."); return; }
    try { setLoading(true); await onSubmit(list); onClose(); }
    catch (e: any) { setError(e?.message || "Error while saving ratings."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Rate participants</h3>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100">Close</button>
        </div>

        <div className="p-5 space-y-4">
          {programTitle && (
            <div className="text-sm text-gray-600">
              Program: <span className="font-semibold text-gray-900">{programTitle}</span>
            </div>
          )}

          <div className="space-y-3">
            {participants.length === 0 ? (
              <div className="text-sm text-gray-500">No unrated participants.</div>
            ) : participants.map(p => (
              <div key={p.userId} className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-gray-800 truncate">{p.userName}</div>
                <input
                  type="number" min={1} max={10} placeholder="1–10"
                  className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                  onChange={(e)=> setR(p.userId, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-100">Cancel</button>
            <button onClick={submit} disabled={loading}
              className="px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-400/90 text-black font-semibold disabled:opacity-40">
              {loading ? "Saving..." : "Save ratings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}