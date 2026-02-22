import { useNavigate } from "react-router-dom";
import { format, differenceInMinutes } from "date-fns";
import type { TermDetails } from "../../models/client/TermDetails";
import { useLockBodyScroll } from "../../hooks/other/useLockBodyScroll";

type Props = {
  open: boolean;
  onClose: () => void;
  data?: TermDetails;
  isTrainer?: boolean;
  onDelete?: (id: number) => void;
};

export default function TermDetailsModal({ open, onClose, data, isTrainer, onDelete }: Props) {
  useLockBodyScroll(open);
  const navigate = useNavigate();

  if (!open || !data) return null;

  const start = new Date(data.startAt);
  const end = new Date(data.endAt);

  const handleStartWorkout = () => {
    if (data.completed) return;
    const now = new Date();
    const diff = differenceInMinutes(start, now);

    if (diff > 15) {
      const confirm = window.confirm(`This session starts in ${diff} minutes. Start early anyway?`);
      if (!confirm) return;
    }

    onClose();
    navigate(`/trainer/live-workout/${data.id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] rounded-2xl border border-[#27273a] bg-[#111118] shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#27273a] flex items-center justify-between sticky top-0 bg-[#111118] z-10">
          <h3 className="text-lg font-semibold text-white">Session details</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#27273a] text-slate-300 hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto overscroll-contain">
          <div>
            <div className="text-sm text-slate-400">Program name</div>
            <div className="font-semibold text-white">{data.title}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-400">Date</div>
              <div className="font-medium text-white">{format(start, "EEE, MMM d")}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Time</div>
              <div className="font-medium text-white">
                {format(start, "HH:mm")}–{format(end, "HH:mm")}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Type</div>
              <div className="font-medium text-white capitalize">{data.type}</div>
            </div>
            {data.trainerName && (
              <div>
                <div className="text-sm text-slate-400">Trainer</div>
                <div className="font-medium text-white">{data.trainerName}</div>
              </div>
            )}
          </div>

          {isTrainer && (
            <div className="pt-6 mt-4 border-t border-[#27273a] flex flex-col gap-3">
              <button
                onClick={handleStartWorkout}
                disabled={!!data.completed}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  data.completed
                    ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                    : "btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f]"
                }`}
              >
                {data.completed ? "Session completed" : "Start workout"}
              </button>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "WARNING: This will permanently delete the session and all client enrollments. Continue?"
                    )
                  ) {
                    onDelete?.(data.id);
                  }
                }}
                className="w-full border border-red-500/20 text-red-400 hover:bg-red-500/10 py-3 rounded-xl font-semibold transition-all text-sm"
              >
                Delete session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}