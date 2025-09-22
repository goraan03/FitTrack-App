import { useEffect, useState } from "react";
import type { Exercise, UpsertExercise, MuscleGroup, Equipment, Level } from "../../types/trainer/Exercise";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface TrainerExercisesPageProps { trainerApi: ITrainerAPIService; }

const groups: MuscleGroup[] = ['full_body','chest','back','legs','shoulders','arms','core','cardio','mobility'];
const equipments: Equipment[] = ['none','bodyweight','dumbbells','barbell','kettlebell','machine','bands','other'];
const levels: Level[] = ['beginner','intermediate','advanced'];

export default function TrainerExercisesPage({ trainerApi }: TrainerExercisesPageProps) {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (!data.name?.trim()) { alert('Name is required'); return; }
    try {
      if (editId) {
        const r = await trainerApi.updateExercise(editId, data);
        if (!r.success) return alert(r.message);
      } else {
        const r = await trainerApi.createExercise(data);
        if (!r.success) return alert(r.message);
      }
      setModal({ open: false, data: modal.data });
      await load();
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this exercise?')) return;
    try {
      const r = await trainerApi.deleteExercise(id);
      if (!r.success) return alert(r.message);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    }
  };

  const LevelBadge = ({ level }: { level: Level }) => {
    const styles: Record<Level, string> = {
      beginner: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
      intermediate: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
      advanced: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    };
    const label = level.charAt(0).toUpperCase() + level.slice(1);
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[level]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_200px_at_10%_0%,rgba(253,224,71,0.06),transparent),radial-gradient(500px_200px_at_90%_10%,rgba(253,224,71,0.04),transparent)]" />
      <div className="relative flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Exercises</h1>
        <button onClick={openNew} className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-400/90 text-black font-semibold shadow-sm">New exercise</button>
      </div>

      {loading ? <div className="relative text-sm text-gray-400">Loading...</div> : (
        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map(ex => (
            <div key={ex.id} className="bg-white/90 backdrop-blur-sm text-black rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-gray-900 truncate">{ex.name}</div>
                <LevelBadge level={ex.level} />
              </div>
              <div className="text-sm text-gray-600 mt-1">{ex.muscleGroup} • {ex.equipment}</div>
              {ex.description && <div className="text-sm text-gray-700 mt-2">{ex.description}</div>}
              <div className="pt-3 flex items-center gap-2">
                <button onClick={()=> openEdit(ex)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">Edit</button>
                <button onClick={()=> del(ex.id)} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center text-gray-400">No exercises yet.</div>
          )}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
          <div className="bg-white text-black w-full max-w-lg rounded-2xl shadow-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">{modal.editId ? 'Edit exercise' : 'New exercise'}</h3>
              <button onClick={()=> setModal(m=> ({...m, open:false}))} className="px-3 py-1.5 rounded-lg border hover:bg-gray-100">Close</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 uppercase">Name</label>
                <input value={modal.data.name} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, name: e.target.value}}))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"/>
              </div>
              <div>
                <label className="block text-xs text-gray-600 uppercase">Description</label>
                <textarea value={modal.data.description || ''} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, description: e.target.value}}))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 min-h-[90px] bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 uppercase">Muscle</label>
                  <select value={modal.data.muscleGroup} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, muscleGroup: e.target.value as any}}))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                    {groups.map(g=> <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 uppercase">Equip</label>
                  <select value={modal.data.equipment || 'none'} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, equipment: e.target.value as any}}))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                    {equipments.map(g=> <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 uppercase">Level</label>
                  <select value={modal.data.level || 'beginner'} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, level: e.target.value as any}}))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                    {levels.map(l=> <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 uppercase">Video URL</label>
                <input value={modal.data.videoUrl || ''} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, videoUrl: e.target.value}}))} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"/>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button onClick={()=> setModal(m=> ({...m, open:false}))} className="px-3 py-2 rounded-xl border hover:bg-gray-100">Cancel</button>
                <button onClick={save} className="px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-400/90 text-black">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}