import { useEffect, useState, useMemo } from "react";
import type { ProgramListItem, ProgramDetails, ProgramExerciseItem, UpsertProgram } from "../../types/trainer/Program";
import type { Exercise } from "../../types/trainer/Exercise";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import { Plus, Save, Trash2, ChevronUp, ChevronDown, Users, Dumbbell, X, Layout, Search, Filter, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

interface TrainerProgramsPageProps { trainerApi: ITrainerAPIService; }

type DraftItem = Omit<ProgramExerciseItem, 'name'>;
const emptyProgram: UpsertProgram = { title: '', description: '', level: 'beginner', isPublic: false };

export default function TrainerProgramsPage({ trainerApi }: TrainerProgramsPageProps) {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [details, setDetails] = useState<ProgramDetails | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [form, setForm] = useState<UpsertProgram>(emptyProgram);
  const [saving, setSaving] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClientId, setFilterClientId] = useState<number | "">("");

  const [draft, setDraft] = useState<DraftItem[]>([]);
  const [chosenExercise, setChosenExercise] = useState<number | ''>('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClientId, setAssignClientId] = useState<number | ''>('');
  const [assigning, setAssigning] = useState(false);

  const loadAll = async () => {
    const [p, e, c] = await Promise.all([
      trainerApi.listPrograms(),
      trainerApi.listExercises(),
      trainerApi.listMyClients(),
    ]);
    if (p.success) setPrograms(p.data);
    if (e.success) setExercises(e.data);
    if (c.success) setClients(c.data);
  };

  const loadDetails = async (id: number) => {
    const d = await trainerApi.getProgramDetails(id);
    if (d.success) {
      setDetails(d.data);
      setForm({ 
        title: d.data.title, 
        description: d.data.description || '', 
        level: d.data.level, 
        isPublic: false 
      });
      setDraft(d.data.exercises.map(x => ({
        exerciseId: x.exerciseId,
        position: x.position,
        sets: x.sets,
        reps: x.reps,
        tempo: x.tempo,
        restSec: x.restSec,
        notes: x.notes,
      })));
    }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { 
    if (selected) { loadDetails(selected); } 
    else { setDetails(null); setDraft([]); setForm(emptyProgram); }
  }, [selected]);

  // Client Filter & Search Logic
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClient = !filterClientId || (
      p.assignedClientIds && p.assignedClientIds.includes(Number(filterClientId))
    );
    
    return matchesSearch && matchesClient;
    });
  }, [programs, searchTerm, filterClientId]);

  const addDraft = () => {
    const exId = Number(chosenExercise);
    if (!exId) return toast.error('Pick an exercise first');
    const pos = draft.length + 1;
    setDraft(d => [...d, { exerciseId: exId, position: pos, sets: 3, reps: '10', tempo: null, restSec: 60, notes: null }]);
    setChosenExercise('');
  };

  const move = (index: number, dir: -1 | 1) => {
    const arr = [...draft];
    const ni = index + dir;
    if (ni < 0 || ni >= arr.length) return;
    const tmp = arr[index]; arr[index] = arr[ni]; arr[ni] = tmp;
    arr.forEach((it, i) => it.position = i + 1);
    setDraft(arr);
  };

  const remove = (index: number) => {
    const arr = draft.filter((_, i) => i !== index);
    arr.forEach((it, i) => it.position = i + 1);
    setDraft(arr);
  };

  const updateDraftItem = (index: number, field: keyof DraftItem, value: any) => {
    const arr = [...draft];
    arr[index] = { ...arr[index], [field]: value };
    setDraft(arr);
  };

  const saveProgram = async () => {
    if (!form.title.trim()) return toast.error('Program title is required');
    setSaving(true);
    try {
      let programId = selected;
      if (!programId) {
        const res = await trainerApi.createProgram(form);
        if (!res.success) return toast.error(res.message || 'Failed to create');
        programId = res.data.id;
        setSelected(programId);
        toast.success('Program created!');
        await loadAll();
      } else {
        const res = await trainerApi.updateProgram(programId, form);
        if (!res.success) return toast.error(res.message || 'Failed to update');
        toast.success('Program updated!');
        await loadAll();
      }
      if (programId && draft.length >= 0) {
        const resEx = await trainerApi.setProgramExercises(programId, draft);
        if (!resEx.success) return toast.error(resEx.message || 'Failed to save exercises');
        await loadDetails(programId);
      }
    } finally { setSaving(false); }
  };

  const assignToClient = async () => {
    if (!selected) return;
    const cid = Number(assignClientId);
    if (!cid) return toast.error('Select a client');
    setAssigning(true);
    try {
      const res = await trainerApi.assignProgramToClient(selected, cid);
      if (res.success) {
        toast.success('Program assigned to client!');
        setShowAssignModal(false);
        await loadDetails(selected);
      } else toast.error(res.message || 'Assignment failed');
    } finally { setAssigning(false); }
  };

  const exerciseName = (id: number) => exercises.find(x => x.id === id)?.name || `Exercise #${id}`;

  const levelStyles = {
    beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    advanced: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 selection:bg-yellow-400 selection:text-black font-sans pb-20">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161616] p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Layout className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                Training <span className="text-yellow-400">Programs</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-medium">Build and manage routines</p>
            </div>
          </div>
          
          {selected && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Assign to Client
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR: SEARCH & LIST */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-[#161616] p-4 rounded-3xl border border-white/5 space-y-3 shadow-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-yellow-400/50 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select 
                  value={filterClientId}
                  onChange={(e) => setFilterClientId(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-yellow-400/50 outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Clients</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">List ({filteredPrograms.length})</h2>
              <button onClick={() => setSelected(null)} className="p-2 bg-white/5 hover:bg-yellow-400 hover:text-black rounded-xl transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161616] rounded-3xl border border-white/5 overflow-hidden shadow-xl max-h-[500px] overflow-y-auto custom-scrollbar p-3 space-y-2">
              {filteredPrograms.length === 0 ? (
                <div className="p-12 text-center opacity-30">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Empty</p>
                </div>
              ) : (
                filteredPrograms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className={`w-full text-left p-5 rounded-2xl transition-all relative group ${
                      selected === p.id ? 'bg-yellow-400' : 'bg-[#1d1d1d]/50 hover:bg-white/5'
                    }`}
                  >
                    <h4 className={`font-black uppercase text-sm truncate ${selected === p.id ? 'text-black' : 'text-white'}`}>
                      {p.title}
                    </h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 mt-2 inline-block rounded-md border ${
                      selected === p.id ? 'bg-black/10 border-black/20 text-black' : levelStyles[p.level]
                    }`}>
                      {p.level}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ASSIGNED CLIENTS INFO - PRIKAZUJE SE SAMO KAD JE SELEKTOVAN PROGRAM */}
            {selected && details && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Assigned To</h3>
                    <p className="text-sm font-bold text-white mt-1">
                      {details.assignedClients && details.assignedClients.length > 0 
                        ? details.assignedClients.map(c => `${c.firstName} ${c.lastName}`).join(", ")
                        : "No clients assigned to this program yet."}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="text-[10px] font-black uppercase tracking-tighter text-blue-400 hover:text-white transition-colors"
                >
                  + Add more
                </button>
              </div>
            )}

            {/* EDITOR CARD */}
            <div className="bg-[#161616] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Title</label>
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-400/50 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Difficulty</label>
                    <select
                      value={form.level}
                      onChange={e => setForm(f => ({ ...f, level: e.target.value as any }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white appearance-none cursor-pointer outline-none font-bold"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
                  <textarea
                    value={form.description || ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white min-h-[100px] outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div /> {/* Spacer */}
                  <button
                    onClick={saveProgram}
                    disabled={saving}
                    className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-30 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : selected ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>

            {/* EXERCISES EDITOR */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-2 h-6 bg-blue-400 rounded-full"></div>
                <h2 className="text-xl font-bold uppercase tracking-tight">Exercises ({draft.length})</h2>
              </div>

              <div className="bg-[#161616] p-4 rounded-3xl border border-white/5 flex flex-col sm:flex-row gap-3">
                <select
                  value={chosenExercise}
                  onChange={e => setChosenExercise(e.target.value as any)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-yellow-400/50 outline-none font-bold"
                >
                  <option value="">Pick exercise...</option>
                  {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <button onClick={addDraft} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-2xl flex items-center gap-2 border border-white/5 transition-all">
                  <Plus className="w-4 h-4 text-yellow-400" /> Add
                </button>
              </div>

              <div className="space-y-4">
                {draft.map((item, idx) => (
                  <div key={idx} className="group bg-[#1d1d1d]/50 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex md:flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#262626] flex items-center justify-center">
                          <span className="text-sm font-black text-white">{item.position}</span>
                        </div>
                        <div className="flex md:flex-col gap-1">
                          <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-0"><ChevronUp className="w-4 h-4"/></button>
                          <button onClick={() => move(idx, 1)} disabled={idx === draft.length - 1} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-0"><ChevronDown className="w-4 h-4"/></button>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors uppercase">{exerciseName(item.exerciseId)}</h4>
                          <button onClick={() => remove(idx)} className="p-2 text-gray-700 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {['sets', 'reps', 'tempo', 'restSec'].map(field => (
                            <div key={field} className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-500 ml-1">{field === 'restSec' ? 'Rest (s)' : field}</label>
                              <input
                                value={(item as any)[field] || ''}
                                onChange={e => updateDraftItem(idx, field as any, field === 'sets' || field === 'restSec' ? Number(e.target.value) : e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-400/40 outline-none font-bold"
                              />
                            </div>
                          ))}
                        </div>
                        <input
                          placeholder="Notes..."
                          value={item.notes || ''}
                          onChange={e => updateDraftItem(idx, 'notes', e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#161616] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-400" /> Assign Program
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-white"><X/></button>
            </div>
            <div className="p-8 space-y-6">
              <select
                value={assignClientId}
                onChange={e => setAssignClientId(e.target.value as any)}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
              <button
                onClick={assignToClient}
                disabled={!assignClientId || assigning}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-30 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                {assigning ? 'Processing...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(250, 204, 21, 0.4); }
      `}</style>
    </div>
  );
}