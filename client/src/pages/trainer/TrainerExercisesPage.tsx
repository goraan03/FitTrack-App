import { useEffect, useState } from "react";
import type { Exercise, UpsertExercise, MuscleGroup, Equipment, Level } from "../../types/trainer/Exercise";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface TrainerExercisesPageProps {
  trainerApi: ITrainerAPIService;
}

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
      beginner: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Exercises</h1>
        <button onClick={openNew} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">New exercise</button>
      </div>

      {loading ? <div className="text-sm text-gray-500">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map(ex => (
            <div key={ex.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-gray-900 truncate">{ex.name}</div>
                <LevelBadge level={ex.level} />
              </div>
              <div className="text-sm text-gray-600 mt-1">{ex.muscleGroup} • {ex.equipment}</div>
              {ex.description && <div className="text-sm text-gray-700 mt-2">{ex.description}</div>}
              <div className="pt-3 flex items-center gap-2">
                <button onClick={()=> openEdit(ex)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition">Edit</button>
                <button onClick={()=> del(ex.id)} className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white transition">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">
              No exercises yet.
            </div>
          )}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold">{modal.editId ? 'Edit exercise' : 'New exercise'}</h3>
              <button onClick={()=> setModal(m=> ({...m, open:false}))} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition">Close</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</label>
                <input
                  value={modal.data.name}
                  onChange={(e)=> setModal(m=> ({...m, data:{...m.data, name: e.target.value}}))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={modal.data.description || ''}
                  onChange={(e)=> setModal(m=> ({...m, data:{...m.data, description: e.target.value}}))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 min-h-[90px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Muscle</label>
                  <select
                    value={modal.data.muscleGroup}
                    onChange={(e)=> setModal(m=> ({...m, data:{...m.data, muscleGroup: e.target.value as any}}))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                    {groups.map(g=> <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Equip</label>
                  <select
                    value={modal.data.equipment || 'none'}
                    onChange={(e)=> setModal(m=> ({...m, data:{...m.data, equipment: e.target.value as any}}))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                    {equipments.map(g=> <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Level</label>
                  <select
                    value={modal.data.level || 'beginner'}
                    onChange={(e)=> setModal(m=> ({...m, data:{...m.data, level: e.target.value as any}}))}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                    {levels.map(l=> <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Video URL</label>
                <input
                  value={modal.data.videoUrl || ''}
                  onChange={(e)=> setModal(m=> ({...m, data:{...m.data, videoUrl: e.target.value}}))}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button onClick={()=> setModal(m=> ({...m, open:false}))} className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={save} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}