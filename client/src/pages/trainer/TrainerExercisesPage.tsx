import { useEffect, useState } from "react";
import type { Exercise, UpsertExercise, MuscleGroup, Equipment, Level } from "../../types/trainer/Exercise";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import { Plus, Dumbbell, Edit3, Trash2, Video, Activity, Layout, X, Save, Search } from "lucide-react";
import toast from "react-hot-toast";

interface TrainerExercisesPageProps { trainerApi: ITrainerAPIService; }

const groups: MuscleGroup[] = ['full_body','chest','back','legs','shoulders','arms','core','cardio','mobility'];
const equipments: Equipment[] = ['none','bodyweight','dumbbells','barbell','kettlebell','machine','bands','other'];
const levels: Level[] = ['beginner','intermediate','advanced'];

export default function TrainerExercisesPage({ trainerApi }: TrainerExercisesPageProps) {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<{open: boolean; editId?: number; data: UpsertExercise}>({
    open: false,
    data: { name: '', description: '', muscleGroup: 'full_body', equipment: 'none', level: 'beginner', videoUrl: '' }
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await trainerApi.listExercises();
      if (res.success) setItems(res.data);
    } finally { setLoading(false); }
  };

  useEffect(()=> { load(); }, []);

  const filteredItems = items.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNew = () => setModal({ open: true, data: { name: '', description: '', muscleGroup: 'full_body', equipment: 'none', level: 'beginner', videoUrl: '' } });
  
  const openEdit = (ex: Exercise) => setModal({
    open: true,
    editId: ex.id,
    data: {
      name: ex.name,
      description: ex.description || '',
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      level: ex.level,
      videoUrl: ex.videoUrl || ''
    }
  });

  const save = async () => {
    const { editId, data } = modal;
    if (!data.name?.trim()) return toast.error('Name is required');
    try {
      const r = editId 
        ? await trainerApi.updateExercise(editId, data)
        : await trainerApi.createExercise(data);
      
      if (!r.success) return toast.error(r.message);
      
      toast.success(editId ? 'Exercise updated' : 'Exercise created');
      setModal({ open: false, data: modal.data });
      await load();
    } catch (e: any) {
      toast.error('Operation failed');
    }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this exercise?')) return;
    try {
      const r = await trainerApi.deleteExercise(id);
      if (!r.success) return toast.error(r.message);
      toast.success('Deleted successfully');
      await load();
    } catch (e: any) {
      toast.error('Delete failed');
    }
  };

  const LevelBadge = ({ level }: { level: Level }) => {
    const styles: Record<Level, string> = {
      beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    };
    return (
      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${styles[level]}`}>
        {level}
      </span>
    );
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
              <Dumbbell className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                Exercise <span className="text-yellow-400">Library</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-medium">Manage your workout movements</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:border-yellow-400/50 outline-none transition-all w-64 font-bold"
              />
            </div>
            <button 
              onClick={openNew} 
              className="px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-yellow-400/10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Exercise
            </button>
          </div>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="flex justify-center pt-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(ex => (
              <div key={ex.id} className="group bg-[#161616] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5 text-yellow-400" />
                    </div>
                    <LevelBadge level={ex.level} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{ex.name}</h3>
                    <p className="text-[10px] font-black uppercase text-gray-500 mt-1 tracking-widest">
                      {ex.muscleGroup.replace('_', ' ')} • {ex.equipment}
                    </p>
                  </div>

                  {ex.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px] leading-relaxed">
                      {ex.description}
                    </p>
                  )}

                  <div className="pt-4 flex items-center gap-2 border-t border-white/5">
                    <button 
                      onClick={()=> openEdit(ex)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={()=> del(ex.id)} 
                      className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-black transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center bg-[#161616] rounded-3xl border border-dashed border-white/10 opacity-30">
                <Dumbbell className="w-12 h-12 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">No exercises found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#161616] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-yellow-400" />
                {modal.editId ? 'Edit' : 'New'} <span className="text-yellow-400">Exercise</span>
              </h3>
              <button onClick={()=> setModal(m=> ({...m, open:false}))} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Exercise Name</label>
                <input 
                  value={modal.data.name} 
                  onChange={(e)=> setModal(m=> ({...m, data:{...m.data, name: e.target.value}}))} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-400/50 outline-none font-bold"
                  placeholder="e.g. Bench Press"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
                <textarea 
                  value={modal.data.description || ''} 
                  onChange={(e)=> setModal(m=> ({...m, data:{...m.data, description: e.target.value}}))} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white min-h-[100px] outline-none transition-all"
                  placeholder="Technique cues..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Muscle</label>
                  <select 
                    value={modal.data.muscleGroup} 
                    onChange={(e)=> setModal(m=> ({...m, data:{...m.data, muscleGroup: e.target.value as any}}))} 
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold appearance-none cursor-pointer"
                  >
                    {groups.map(g=> <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Equipment</label>
                  <select 
                    value={modal.data.equipment || 'none'} 
                    onChange={(e)=> setModal(m=> ({...m, data:{...m.data, equipment: e.target.value as any}}))} 
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold appearance-none cursor-pointer"
                  >
                    {equipments.map(g=> <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Level</label>
                  <select 
                    value={modal.data.level || 'beginner'} 
                    onChange={(e)=> setModal(m=> ({...m, data:{...m.data, level: e.target.value as any}}))} 
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none font-bold appearance-none cursor-pointer"
                  >
                    {levels.map(l=> <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                  <Video className="w-3 h-3" /> Video URL
                </label>
                <input 
                  value={modal.data.videoUrl || ''} 
                  onChange={(e)=> setModal(m=> ({...m, data:{...m.data, videoUrl: e.target.value}}))} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-yellow-400/50 outline-none font-bold"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <button 
                onClick={save} 
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-yellow-400/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}