import { useNavigate } from "react-router-dom";
import { format, differenceInMinutes } from "date-fns";
import type { TermDetails } from "../../models/client/TermDetails";
import { useLockBodyScroll } from "../../hooks/other/useLockBodyScroll";
import { useEffect, useState } from "react";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { ProgramListItem } from "../../types/trainer/Program";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  data?: TermDetails;
  isTrainer?: boolean;
  onDelete?: (id: number) => void;
  trainerApi?: ITrainerAPIService;
  onProgramSet?: () => void;
};

export default function TermDetailsModal({ open, onClose, data, isTrainer, onDelete, trainerApi, onProgramSet }: Props) {
  useLockBodyScroll(open);
  const navigate = useNavigate();

  const [clientPrograms, setClientPrograms] = useState<ProgramListItem[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number>(0);
  const [settingProgram, setSettingProgram] = useState(false);

  useEffect(() => {
    if (!open || !isTrainer || !trainerApi || !data?.enrolledClientId) {
      setClientPrograms([]);
      setSelectedProgramId(0);
      return;
    }
    trainerApi.listProgramsForClient(data.enrolledClientId).then(res => {
      if (res.success) setClientPrograms(res.data);
    });
  }, [open, data?.enrolledClientId, isTrainer]);

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

  const handleSetProgram = async () => {
    if (!trainerApi || !selectedProgramId || !data.id) return;
    setSettingProgram(true);
    try {
      const res = await trainerApi.setTermProgram(data.id, selectedProgramId);
      if (res.success) {
        toast.success("Program set for this session");
        onProgramSet?.();
        onClose();
      } else {
        toast.error(res.message || "Failed to set program");
      }
    } catch {
      toast.error("Failed to set program");
    } finally {
      setSettingProgram(false);
    }
  };

  const needsProgramSelection = isTrainer && !!data.enrolledClientId && !data.programId && clientPrograms.length > 0;

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
          {(data.programId || data.programTitle) ? (
            <div>
              <div className="text-sm text-slate-400">Program</div>
              <div className="font-semibold text-white">{data.programTitle || data.title}</div>
            </div>
          ) : (
            <div>
              <div className="text-sm text-slate-400">Program</div>
              <div className="font-semibold text-amber-400/80 italic text-sm">Not assigned yet</div>
            </div>
          )}

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

          {isTrainer && data.enrolledClientId && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-xs text-cyan-400 uppercase font-semibold tracking-wide mb-1">Client</div>
              <div className="font-medium text-white">{data.enrolledClientName || `Client #${data.enrolledClientId}`}</div>
            </div>
          )}

          {isTrainer && !data.enrolledClientId && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">Booking status</div>
              <div className="text-sm text-slate-400">No client has booked this slot yet</div>
            </div>
          )}

          {needsProgramSelection && (
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 space-y-3">
              <div className="text-xs text-amber-400 uppercase font-semibold tracking-wide">
                Select program for this session
              </div>
              <p className="text-xs text-slate-400">
                Programs assigned to {data.enrolledClientName || 'this client'}:
              </p>
              <select
                value={selectedProgramId}
                onChange={e => setSelectedProgramId(Number(e.target.value))}
                className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40 appearance-none cursor-pointer"
              >
                <option value={0}>Choose a program...</option>
                {clientPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <button
                onClick={handleSetProgram}
                disabled={!selectedProgramId || settingProgram}
                className="w-full py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {settingProgram ? "Saving..." : "Confirm Program"}
              </button>
            </div>
          )}

          {isTrainer && !!data.enrolledClientId && !data.programId && clientPrograms.length === 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-xs text-rose-400 uppercase font-semibold tracking-wide mb-1">No programs available</div>
              <div className="text-sm text-slate-400">
                No active programs are assigned to this client. Go to Programs to assign one first.
              </div>
            </div>
          )}

          {isTrainer && (
            <div className="pt-6 mt-4 border-t border-[#27273a] flex flex-col gap-3">
              <button
                onClick={handleStartWorkout}
                disabled={!!data.completed || !data.enrolledClientId || !data.programId}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  data.completed
                    ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                    : !data.enrolledClientId || !data.programId
                    ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                    : "btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f]"
                }`}
              >
                {data.completed
                  ? "Session completed"
                  : !data.enrolledClientId
                  ? "Waiting for client to book"
                  : !data.programId
                  ? "Select a program first"
                  : "Start workout"}
              </button>

              <button
                onClick={() => {
                  if (window.confirm("WARNING: This will permanently delete the session and all client enrollments. Continue?")) {
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
