import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ITrainerAPIService } from '../../api_services/trainer/ITrainerAPIService';
import toast from 'react-hot-toast';
import { CheckCircle2, ChevronLeft, Dumbbell, Plus, User } from 'lucide-react';

interface LiveWorkoutPageProps {
  trainerApi: ITrainerAPIService;
}

export default function LiveWorkoutPage({ trainerApi }: LiveWorkoutPageProps) {
  const { termId } = useParams<{ termId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Array<{userId: number; userName: string}>>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [programTitle, setProgramTitle] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [startTime] = useState(new Date().toISOString());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [secondsRemaining]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!termId) return;
      try {
        setLoading(true);
        
        const partRes = await trainerApi.getTermParticipants(Number(termId));
        setParticipants(partRes.data || []);
        
        if (partRes.data && partRes.data.length === 1) {
          setSelectedClientId(partRes.data[0].userId);
        }
        
        const termsRes = await trainerApi.listTerms();
        const currentTerm = termsRes.data.find((t: any) => t.id === Number(termId)) as any;

        if (!currentTerm) {
          toast.error('Session not found');
          navigate('/trainer/dashboard');
          return;
        }

        if (currentTerm.completed) {
          toast.success('Training is already completed');
          navigate('/trainer/dashboard');
          return;
        }

        setSecondsRemaining((currentTerm.durationMin || 60) * 60);

        let pId = currentTerm.programId || currentTerm.program_id;
        if (!pId) {
          const programsRes = await trainerApi.listPrograms();
          const found = programsRes.data.find(p => p.title === currentTerm.programTitle);
          pId = found?.id;
        }

        const programRes = await trainerApi.getProgramDetails(pId);
        setProgramTitle(programRes.data.title);

        const initialLogs: any[] = [];
        programRes.data.exercises.forEach((ex: any) => {
          const setsCount = Number(ex.sets) || 1;
          for (let i = 1; i <= setsCount; i++) {
            initialLogs.push({
              exerciseId: ex.exerciseId,
              name: ex.name || "Vježba",
              setNumber: i,
              plannedReps: ex.reps || null,
              actualReps: parseInt(ex.reps) || 0,
              actualWeight: 0,
            });
          }
        });
        setLogs(initialLogs);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Error loading workout data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [termId, trainerApi, navigate]);

  const addSet = (exerciseId: number, name: string) => {
    const exerciseSets = logs.filter(l => l.exerciseId === exerciseId);
    const newSetNumber = exerciseSets.length + 1;
    
    const newSet = {
      exerciseId,
      name,
      setNumber: newSetNumber,
      actualReps: exerciseSets.length > 0 ? exerciseSets[exerciseSets.length - 1].actualReps : 0,
      actualWeight: exerciseSets.length > 0 ? exerciseSets[exerciseSets.length - 1].actualWeight : 0,
    };
    
    setLogs(prev => [...prev, newSet]);
    toast.success(`Added set ${newSetNumber} for ${name}`);
  };

  const updateLog = (idx: number, field: string, val: any) => {
    const newLogs = [...logs];
    newLogs[idx] = { ...newLogs[idx], [field]: val };
    setLogs(newLogs);
  };

  const handleFinish = async () => {
    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to finish this workout?\n\nThis will save all data and mark the workout as completed.\n\nClient: ${participants.find(p => p.userId === selectedClientId)?.userName}`
    );
    
    if (!confirmed) return;
    
    try {
      const res = await trainerApi.finishWorkout({
        termId: Number(termId),
        clientId: selectedClientId,
        startTime,
        endTime: new Date().toISOString(),
        logs: logs.map(l => ({
          exerciseId: l.exerciseId,
          setNumber: l.setNumber,
          plannedReps: l.plannedReps ?? null,
          actualReps: Number(l.actualReps) || 0,
          actualWeight: Number(l.actualWeight) || 0
        }))
      });
      
      if (res.success) {
        toast.success("Workout successfully saved!");
        navigate('/trainer/dashboard');
      } else {
        toast.error(res.message || "Error saving workout");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error saving workout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">
            Loading workout...
          </p>
        </div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white px-4 grid place-items-center">
        <div className="w-full max-w-xl bg-[#111118] border border-[#27273a] rounded-2xl p-8 shadow-[0_18px_60px_rgba(0,0,0,0.40)] text-center space-y-4 opacity-0 animate-fade-in-up">
          <div className="text-5xl">⚠️</div>
          <div className="text-xl font-bold">No participants</div>
          <div className="text-slate-400">
            This session currently has no participants.
          </div>
          <button
            onClick={() => navigate("/trainer/dashboard")}
            className="mt-2 w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#0a0a0f] font-semibold active:scale-[0.99] transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const exerciseIds = Array.from(new Set(logs.map(l => l.exerciseId)));

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-32">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 glass">
        <div className="max-w-xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 grid place-items-center transition-all active:scale-95"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="text-center min-w-0">
              <div className="text-amber-400 text-3xl font-black tabular-nums leading-none">
                {formatTime(secondsRemaining)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold truncate max-w-[260px] mx-auto">
                {programTitle}
              </div>
            </div>

            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative">
        {/* No participants */}
        {participants.length === 0 && (
          <div className="px-4 pt-6">
            <div
              className="max-w-xl mx-auto bg-[#111118] border border-[#27273a] rounded-3xl p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)]
                        opacity-0 animate-fade-in-up stagger-1"
            >
              <div className="text-6xl mb-3">⚠️</div>
              <div className="text-xl font-black uppercase tracking-tight">No participants</div>
              <div className="text-slate-400 mt-2">This session has no participants.</div>

              <button
                onClick={() => navigate("/trainer/dashboard")}
                className="mt-6 w-full btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600
                          text-[#0a0a0f] font-black uppercase tracking-widest rounded-2xl py-4 transition-all active:scale-[0.99]"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        )}

        {participants.length > 1 && !selectedClientId && (
          <div className="px-4 pt-6">
            <div
              className="max-w-xl mx-auto bg-[#111118] rounded-3xl p-6 border border-[#27273a]
                        shadow-[0_30px_90px_rgba(0,0,0,0.6)] opacity-0 animate-fade-in-up stagger-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    Select participant
                  </div>
                  <div className="text-xl font-black uppercase tracking-tight">Who are you training?</div>
                </div>
              </div>

              <div className="space-y-3">
                {participants.map((p, idx) => (
                  <button
                    key={p.userId}
                    onClick={() => setSelectedClientId(p.userId)}
                    className={`
                      w-full p-4 rounded-2xl text-left transition-all border
                      bg-[#0a0a0f]/50 border-white/5 hover:bg-white/5 hover:border-amber-400/30
                      active:scale-[0.99]
                      opacity-0 animate-fade-in-up
                      ${idx === 0 ? "stagger-2" : idx === 1 ? "stagger-3" : idx === 2 ? "stagger-4" : "stagger-5"}
                    `}
                  >
                    <div className="font-black uppercase tracking-tight text-white">{p.userName}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                      Tap to start logging
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedClientId && (
          <div className="px-4 pt-6">
            <div className="max-w-xl mx-auto space-y-8">
              <div className="opacity-0 animate-fade-in-up stagger-1">
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm text-amber-400 font-bold truncate">
                      Client: {participants.find((p) => p.userId === selectedClientId)?.userName}
                    </span>
                  </div>
                  {participants.length > 1 && (
                    <button
                      onClick={() => setSelectedClientId(null)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Exercises */}
              {exerciseIds.map((id, cardIdx) => {
                const exerciseSets = logs
                  .map((l, i) => ({ ...l, originalIdx: i }))
                  .filter((l) => l.exerciseId === id);
                const name = exerciseSets[0]?.name || "Exercise";

                return (
                  <div
                    key={id}
                    className={`
                      bg-[#111118] rounded-[2.5rem] border border-[#27273a] overflow-hidden
                      shadow-[0_30px_90px_rgba(0,0,0,0.6)]
                      opacity-0 animate-fade-in-up
                      ${cardIdx === 0 ? "stagger-2" : cardIdx === 1 ? "stagger-3" : cardIdx === 2 ? "stagger-4" : "stagger-5"}
                    `}
                  >
                    <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-amber-400 rounded-xl shrink-0">
                          <Dumbbell className="text-black w-5 h-5" />
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-tight truncate">{name}</h3>
                      </div>

                      <button
                        onClick={() => addSet(id, name)}
                        className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400
                                  hover:bg-amber-400/15 transition-all active:scale-95 grid place-items-center"
                        aria-label="Add set"
                        title="Add set"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="p-4 space-y-3">
                      {exerciseSets.map((s, idx) => (
                        <div
                          key={s.originalIdx}
                          className={`
                            grid grid-cols-12 gap-3 bg-[#0a0a0f]/60 p-4 rounded-2xl items-center border border-white/5
                            opacity-0 animate-fade-in-up
                            ${idx === 0 ? "stagger-2" : idx === 1 ? "stagger-3" : "stagger-4"}
                          `}
                        >
                          <div className="col-span-2 text-center">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/20 grid place-items-center">
                              <span className="text-amber-400 font-black text-lg">#{s.setNumber}</span>
                            </div>
                          </div>

                          <div className="col-span-5">
                            <label className="text-[9px] text-slate-500 block uppercase font-black tracking-widest mb-1">
                              Reps
                            </label>
                            <input
                              type="number"
                              className="bg-transparent w-full text-2xl font-black outline-none border-b border-white/10 focus:border-amber-400
                                        transition-colors tabular-nums"
                              value={s.actualReps}
                              onChange={(e) => updateLog(s.originalIdx, "actualReps", e.target.value)}
                            />
                          </div>

                          <div className="col-span-5">
                            <label className="text-[9px] text-slate-500 block uppercase font-black tracking-widest mb-1">
                              Weight (kg)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              className="bg-transparent w-full text-2xl font-black outline-none border-b border-white/10 focus:border-amber-400
                                        transition-colors tabular-nums"
                              value={s.actualWeight}
                              onChange={(e) => updateLog(s.originalIdx, "actualWeight", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Spacer so fixed button doesn't cover content */}
              <div className="h-24" />
            </div>
          </div>
        )}

        {/* Finish Button */}
        {selectedClientId && (
          <div className="fixed bottom-6 left-4 right-4 z-40 opacity-0 animate-fade-in-up stagger-5">
            <button
              onClick={handleFinish}
              className="
                w-full max-w-xl mx-auto
                btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600
                text-[#0a0a0f] font-black py-5 rounded-[2rem]
                uppercase text-base sm:text-lg
                shadow-[0_30px_90px_rgba(0,0,0,0.75)]
                active:scale-[0.99] transition-all
                flex items-center justify-center gap-3
              "
            >
              <CheckCircle2 className="w-6 h-6" />
              Finish workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
