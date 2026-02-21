import { useEffect, useState } from "react";
import type { ProgramListItem } from "../../types/trainer/Program";
import type { TrainerTerm } from "../../types/trainer/Term";
import { format } from "date-fns";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import { Calendar, Clock, Users, Plus, Trash2, Activity, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function TrainerTermsPage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [terms, setTerms] = useState<TrainerTerm[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ 
    programId: 0, 
    type: 'individual' as 'individual'|'group', 
    startDate: '', 
    startTime: '', 
    durationMin: 60, 
    capacity: 1 
  });

  const load = async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([trainerApi.listPrograms(), trainerApi.listTerms()]);
      if (p.success) setPrograms(p.data);
      if (t.success) {
        const activeProgramIds = new Set((p.success ? p.data : []).map(pr => pr.id));
        const filtered = t.data.filter(term => activeProgramIds.has(term.programId));
        setTerms(filtered);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { 
    if (form.type === 'individual') setForm(f => ({ ...f, capacity: 1 })); 
  }, [form.type]);

  const save = async () => {
    if (!form.programId) return toast.error('Pick a program');
    if (!form.startDate || !form.startTime) return toast.error('Pick date and time');
    
    const startAtISO = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
    const r = await trainerApi.createTerm({
      programId: Number(form.programId), 
      type: form.type, 
      startAtISO, 
      durationMin: form.durationMin, 
      capacity: form.capacity
    });

    if (!r.success) return toast.error(r.message);
    
    toast.success('Term created successfully');
    await load();
  };

  const cancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this term?')) return;
    const r = await trainerApi.cancelTerm(id);
    if (!r.success) return toast.error(r.message);
    toast.success('Term canceled');
    await load();
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 selection:bg-yellow-400 selection:text-black font-sans pb-20">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161616] p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                Training <span className="text-yellow-400">Schedule</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-medium">Manage your terms and bookings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CREATE TERM FORM */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-6 bg-yellow-400 rounded-full"></div>
              <h2 className="text-xl font-bold uppercase tracking-tight">Create New Term</h2>
            </div>

            <div className="bg-[#161616] rounded-3xl border border-white/5 p-8 shadow-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Select Program</label>
                <select 
                  value={form.programId} 
                  onChange={e => setForm(f => ({ ...f, programId: Number(e.target.value) }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-400/50 outline-none font-bold appearance-none cursor-pointer"
                >
                  <option value={0}>Choose a program...</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Type</label>
                  <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setForm(f => ({ ...f, type: 'individual' }))}
                      className={`flex-1 py-2.5 px-1 text-[9px] md:text-[10px] font-black uppercase rounded-xl transition-all ${
                        form.type === 'individual' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      Individual
                    </button>
                    <button 
                      onClick={() => setForm(f => ({ ...f, type: 'group' }))}
                      className={`flex-1 py-2.5 px-1 text-[9px] md:text-[10px] font-black uppercase rounded-xl transition-all ${
                        form.type === 'group' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      Group
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Capacity</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="number" 
                      disabled={form.type === 'individual'} 
                      value={form.capacity} 
                      onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white outline-none disabled:opacity-20 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Date</label>
                  <input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-400/50 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Time</label>
                  <input 
                    type="time" 
                    value={form.startTime} 
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-400/50 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Duration (Minutes)
                </label>
                <input 
                  type="number" 
                  value={form.durationMin} 
                  onChange={e => setForm(f => ({ ...f, durationMin: Number(e.target.value) }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-400/50 outline-none font-bold"
                />
              </div>

              <button 
                onClick={save} 
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-yellow-400/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Term
              </button>
            </div>
          </div>

          {/* RIGHT: UPCOMING TERMS LIST */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-400 rounded-full"></div>
                <h2 className="text-xl font-bold uppercase tracking-tight">Upcoming Terms</h2>
              </div>
              <Activity className="w-5 h-5 text-gray-500" />
            </div>

            <div className="bg-[#161616] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              {loading ? (
                <div className="p-20 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {terms.length === 0 ? (
                    <div className="p-20 text-center opacity-30">
                      <Calendar className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">No terms scheduled</p>
                    </div>
                  ) : (
                    terms.map(t => (
                      <div key={t.id} className={`p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors ${t.canceled ? 'opacity-40' : ''}`}>
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border ${t.canceled ? 'border-gray-500 bg-gray-500/10' : 'border-yellow-400/20 bg-yellow-400/5 text-yellow-400'}`}>
                            <span className="text-[10px] font-black uppercase">{format(new Date(t.startAt), 'MMM')}</span>
                            <span className="text-lg font-black leading-none">{format(new Date(t.startAt), 'dd')}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black uppercase text-sm tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                                {t.programTitle}
                              </h4>
                              {t.canceled && (
                                <span className="flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded">
                                  <AlertCircle className="w-2 h-2" /> Canceled
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-gray-500">
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                                <Clock className="w-3 h-3" /> {format(new Date(t.startAt), 'HH:mm')} ({t.durationMin} min)
                              </span>
                              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                                <Users className="w-3 h-3" /> {t.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!t.canceled && (
                          <button 
                            onClick={() => cancel(t.id)}
                            className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* Sakriva default ikone kalendara i sata radi čistijeg dizajna */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
