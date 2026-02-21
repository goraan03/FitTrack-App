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
        
        // 1. ✅ Dohvati učesnike
        const partRes = await trainerApi.getTermParticipants(Number(termId));
        setParticipants(partRes.data || []);
        
        // 2. Ako je samo 1 učesnik, automatski selektuj
        if (partRes.data && partRes.data.length === 1) {
          setSelectedClientId(partRes.data[0].userId);
        }
        
        // 3. Dohvati term details
        const termsRes = await trainerApi.listTerms();
        const currentTerm = termsRes.data.find((t: any) => t.id === Number(termId)) as any;

        if (!currentTerm) {
          toast.error('Termin nije pronađen');
          navigate('/trainer/dashboard');
          return;
        }

        // Ako je termin već završen, vrati na dashboard
        if (currentTerm.completed) {
          toast.success('Trening je već završen');
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
        toast.error(err?.response?.data?.message || "Greška pri učitavanju");
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
    toast.success(`Dodat set ${newSetNumber} za ${name}`);
  };

  const updateLog = (idx: number, field: string, val: any) => {
    const newLogs = [...logs];
    newLogs[idx] = { ...newLogs[idx], [field]: val };
    setLogs(newLogs);
  };

  const handleFinish = async () => {
    if (!selectedClientId) {
      toast.error('Izaberi klijenta');
      return;
    }

    // ✅ Confirmation dialog
    const confirmed = window.confirm(
      `Da li si siguran da želiš da završiš trening?\n\nOvo će sačuvati sve podatke i označiti trening kao završen.\n\nKlijent: ${participants.find(p => p.userId === selectedClientId)?.userName}`
    );
    
    if (!confirmed) return;
    
    try {
      const res = await trainerApi.finishWorkout({
        termId: Number(termId),
        clientId: selectedClientId, // ✅ Pravi clientId!
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
        toast.success("Trening uspešno sačuvan!");
        navigate('/trainer/dashboard');
      } else {
        toast.error(res.message || "Greška pri čuvanju");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Greška pri čuvanju");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-yellow-400 font-bold">
        Učitavanje podataka...
      </div>
    );
  }

  // Ako nema učesnika
  if (participants.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center flex-col gap-4 text-white p-4">
        <div className="text-6xl">⚠️</div>
        <div className="text-xl font-bold">Nema prijavljenih učesnika</div>
        <div className="text-gray-400">Ovaj termin nema učesnike za trening.</div>
        <button 
          onClick={() => navigate('/trainer/dashboard')}
          className="mt-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl"
        >
          Nazad na Dashboard
        </button>
      </div>
    );
  }

  const exerciseIds = Array.from(new Set(logs.map(l => l.exerciseId)));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#111] border-b border-white/10 p-4 flex justify-between items-center backdrop-blur-md bg-opacity-80">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="text-center">
          <div className="text-yellow-400 text-3xl font-black tabular-nums">
            {formatTime(secondsRemaining)}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            {programTitle}
          </div>
        </div>
        <div className="w-8" />
      </div>

      {/* Client Selector (ako ima više učesnika i nije selektovan) */}
      {participants.length > 1 && !selectedClientId && (
        <div className="p-4 max-w-xl mx-auto">
          <div className="bg-[#161616] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-400 rounded-xl">
                <User className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-2xl font-black">Izaberi klijenta:</h3>
            </div>
            <div className="space-y-3">
              {participants.map(p => (
                <button
                  key={p.userId}
                  onClick={() => setSelectedClientId(p.userId)}
                  className="w-full p-4 bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400 rounded-xl text-left transition font-semibold"
                >
                  {p.userName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Cards (samo ako je klijent selektovan) */}
      {selectedClientId && (
        <div className="p-4 max-w-xl mx-auto space-y-8">
          {/* Selected Client Badge */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-semibold">
                Klijent: {participants.find(p => p.userId === selectedClientId)?.userName}
              </span>
            </div>
            {participants.length > 1 && (
              <button
                onClick={() => setSelectedClientId(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Promeni
              </button>
            )}
          </div>

          {/* Exercises */}
          {exerciseIds.map(id => {
            const exerciseSets = logs.map((l, i) => ({...l, originalIdx: i})).filter(l => l.exerciseId === id);
            const name = exerciseSets[0]?.name || "Vježba";

            return (
              <div key={id} className="bg-[#161616] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-6 bg-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-400 rounded-xl">
                      <Dumbbell className="text-black w-5 h-5" />
                    </div>
                    <h3 className="font-black text-lg uppercase tracking-tight">{name}</h3>
                  </div>
                  <button 
                    onClick={() => addSet(id, name)}
                    className="bg-yellow-400/10 text-yellow-400 p-2 rounded-full hover:bg-yellow-400/20 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-4 space-y-3">
                  {exerciseSets.map((s) => (
                    <div key={s.originalIdx} className="grid grid-cols-12 gap-3 bg-black/40 p-4 rounded-2xl items-center border border-white/5">
                      <div className="col-span-2 text-center text-yellow-400 font-black text-xl">
                        #{s.setNumber}
                      </div>
                      <div className="col-span-5">
                        <label className="text-[9px] text-gray-500 block uppercase font-bold mb-1">
                          Reps
                        </label>
                        <input 
                          type="number"
                          className="bg-transparent w-full text-2xl font-black outline-none border-b border-white/10 focus:border-yellow-400"
                          value={s.actualReps}
                          onChange={(e) => updateLog(s.originalIdx, 'actualReps', e.target.value)}
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="text-[9px] text-gray-500 block uppercase font-bold mb-1">
                          Weight (kg)
                        </label>
                        <input 
                          type="number"
                          step="0.5"
                          className="bg-transparent w-full text-2xl font-black outline-none border-b border-white/10 focus:border-yellow-400"
                          value={s.actualWeight}
                          onChange={(e) => updateLog(s.originalIdx, 'actualWeight', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Finish Button */}
          <button 
            onClick={handleFinish}
            className="fixed bottom-6 left-4 right-4 max-w-xl mx-auto bg-yellow-400 text-black font-black py-6 rounded-[2rem] uppercase text-xl shadow-2xl shadow-yellow-400/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            Završi Trening
          </button>
        </div>
      )}
    </div>
  );
}
