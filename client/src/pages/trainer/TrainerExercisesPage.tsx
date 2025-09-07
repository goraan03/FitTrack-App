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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
        <button onClick={openNew} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">New exercise</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(ex => (
            <div key={ex.id} className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{ex.name}</div>
                <div className="text-xs text-gray-500">{ex.level}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">{ex.muscleGroup} • {ex.equipment}</div>
              {ex.description && <div className="text-sm text-gray-700 mt-2">{ex.description}</div>}
              <div className="pt-3 flex items-center gap-2">
                <button onClick={()=> openEdit(ex)} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50">Edit</button>
                <button onClick={()=> del(ex.id)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-6 text-center text-gray-500">
              No exercises yet.
            </div>
          )}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl ring-1 ring-gray-200">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">{modal.editId ? 'Edit exercise' : 'New exercise'}</h3>
              <button onClick={()=> setModal(m=> ({...m, open:false}))} className="px-3 py-1.5 rounded-lg border">Close</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs text-gray-500">Name</label>
                <input value={modal.data.name} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, name: e.target.value}}))}
                       className="w-full rounded-lg border px-3 py-2"/>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Description</label>
                <textarea value={modal.data.description || ''} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, description: e.target.value}}))}
                          className="w-full rounded-lg border px-3 py-2"/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500">Muscle</label>
                  <select value={modal.data.muscleGroup} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, muscleGroup: e.target.value as any}}))}
                          className="w-full rounded-lg border px-3 py-2">
                    {groups.map(g=> <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Equip</label>
                  <select value={modal.data.equipment || 'none'} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, equipment: e.target.value as any}}))}
                          className="w-full rounded-lg border px-3 py-2">
                    {equipments.map(g=> <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Level</label>
                  <select value={modal.data.level || 'beginner'} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, level: e.target.value as any}}))}
                          className="w-full rounded-lg border px-3 py-2">
                    {levels.map(l=> <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Video URL</label>
                <input value={modal.data.videoUrl || ''} onChange={(e)=> setModal(m=> ({...m, data:{...m.data, videoUrl: e.target.value}}))}
                       className="w-full rounded-lg border px-3 py-2"/>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button onClick={()=> setModal(m=> ({...m, open:false}))} className="px-3 py-2 rounded-xl border">Cancel</button>
                <button onClick={save} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}