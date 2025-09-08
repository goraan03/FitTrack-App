import { useEffect, useState } from "react";
import type { ProgramListItem, ProgramDetails, ProgramExerciseItem, UpsertProgram } from "../../types/trainer/Program";
import type { Exercise } from "../../types/trainer/Exercise";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface TrainerProgramsPageProps {
  trainerApi: ITrainerAPIService;
}

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

  const [draft, setDraft] = useState<DraftItem[]>([]);
  const [chosenExercise, setChosenExercise] = useState<number | ''>('');

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
      setForm({ title: d.data.title, description: d.data.description || '', level: d.data.level, isPublic: false });
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

  useEffect(()=> { loadAll(); }, []);
  useEffect(()=> { if (selected) loadDetails(selected); else { setDetails(null); setDraft([]); setForm(emptyProgram); }}, [selected]);

  const addDraft = () => {
    const exId = Number(chosenExercise);
    if (!exId) return;
    const pos = draft.length + 1;
    setDraft(d => [...d, { exerciseId: exId, position: pos, sets: null, reps: null, tempo: null, restSec: null, notes: null }]);
    setChosenExercise('');
  };

  const move = (index: number, dir: -1 | 1) => {
    const arr = [...draft];
    const ni = index + dir;
    if (ni < 0 || ni >= arr.length) return;
    const tmp = arr[index]; arr[index] = arr[ni]; arr[ni] = tmp;
    // Recalculate positions
    arr.forEach((it, i) => it.position = i + 1);
    setDraft(arr);
  };

  const remove = (index: number) => {
    const arr = draft.filter((_, i) => i !== index);
    arr.forEach((it, i) => it.position = i + 1);
    setDraft(arr);
  };

  const saveProgram = async () => {
    setSaving(true);
    try {
      if (!selected) {
        // create
        if (!form.title.trim()) { alert('Title is required'); return; }
        const res = await trainerApi.createProgram(form);
        if (!res.success) return alert(res.message);
        setSelected(res.data.id);
        await loadAll();
      } else {
        const res = await trainerApi.updateProgram(selected, form);
        if (!res.success) return alert(res.message);
        await loadAll();
        await loadDetails(selected);
      }
    } finally { setSaving(false); }
  };

  const saveExercises = async () => {
    if (!selected) return alert('Select a program first');
    const res = await trainerApi.setProgramExercises(selected, draft);
    if (!res.success) return alert(res.message);
    await loadDetails(selected);
    alert('Program exercises saved');
  };

  const [assignClientId, setAssignClientId] = useState<number | ''>('');
  const assignToClient = async () => {
    if (!selected) return alert('Select a program');
    const cid = Number(assignClientId);
    if (!cid) return alert('Pick client');
    const res = await trainerApi.assignProgramToClient(selected, cid);
    if (!res.success) return alert(res.message);
    alert('Assigned to client');
  };

  const exerciseName = (id: number) => exercises.find(x => x.id === id)?.name || `#${id}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Programs</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Programs list */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-24 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">My programs</h3>
            <button
              onClick={()=> setSelected(null)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              New
            </button>
          </div>
          <div className="mt-3 divide-y divide-gray-100 max-h-[70vh] overflow-y-auto pr-1">
            {programs.map(p => (
              <button
                key={p.id}
                onClick={()=> setSelected(p.id)}
                className={`w-full text-left py-3 px-3 rounded-xl border transition-all hover:border-gray-200 hover:bg-gray-50 ${
                  selected===p.id ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100' : 'border-transparent'
                }`}
              >
                <div className="font-medium text-gray-900 truncate">{p.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {p.level} {p.isPublic ? '• public' : ''}
                </div>
              </button>
            ))}
            {programs.length===0 && (
              <div className="text-sm text-gray-500 py-8 text-center">No programs yet.</div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          {/* Program form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Title</label>
              <input
                value={form.title}
                onChange={e=> setForm(f=> ({...f, title: e.target.value}))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
            <div className="md:col-span-12">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Description</label>
              <textarea
                value={form.description || ''}
                onChange={e=> setForm(f=> ({...f, description: e.target.value}))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 min-h-[90px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Level</label>
              <select
                value={form.level}
                onChange={e=> setForm(f=> ({...f, level: e.target.value as any}))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
              >
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </div>
            <div className="md:col-span-4 flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.isPublic}
                  onChange={e=> setForm(f=> ({...f, isPublic: e.target.checked}))}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                Public
              </label>
            </div>
            <div className="md:col-span-3 flex items-end justify-end">
              <button
                onClick={saveProgram}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {selected ? 'Save' : 'Create'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-100"></div>

          {/* Add exercise */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={chosenExercise}
              onChange={e=> setChosenExercise(e.target.value as any)}
              className="rounded-xl border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="">Pick exercise</option>
              {exercises.map(e=> <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <button
              onClick={addDraft}
              className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              Add
            </button>
          </div>

          {/* Draft list */}
          <div className="mt-4 space-y-3">
            {draft.map((it, idx) => (
              <div
                key={`${it.exerciseId}-${it.position}`}
                className="p-4 rounded-xl border border-gray-200 bg-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    {it.position}. {exerciseName(it.exerciseId)}
                  </div>
                  <div className="text-xs text-gray-500">sets / reps / tempo / rest / notes</div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-3">
                    <input
                      type="number"
                      placeholder="sets"
                      value={it.sets ?? ''}
                      onChange={e=> {
                        const v = e.target.value ? Number(e.target.value) : null;
                        setDraft(arr => arr.map((x, i)=> i===idx? {...x, sets: v }: x));
                      }}
                      className="rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      placeholder="reps"
                      value={it.reps ?? ''}
                      onChange={e=> setDraft(arr => arr.map((x,i)=> i===idx? {...x, reps: e.target.value || null}: x))}
                      className="rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      placeholder="tempo"
                      value={it.tempo ?? ''}
                      onChange={e=> setDraft(arr => arr.map((x,i)=> i===idx? {...x, tempo: e.target.value || null}: x))}
                      className="rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      placeholder="rest (sec)"
                      value={it.restSec ?? ''}
                      onChange={e=> setDraft(arr => arr.map((x,i)=> i===idx? {...x, restSec: e.target.value? Number(e.target.value): null}: x))}
                      className="rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      placeholder="notes"
                      value={it.notes ?? ''}
                      onChange={e=> setDraft(arr => arr.map((x,i)=> i===idx? {...x, notes: e.target.value || null}: x))}
                      className="rounded-lg border border-gray-200 px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 md:self-start">
                  <button onClick={()=> move(idx,-1)} className="px-2 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition">↑</button>
                  <button onClick={()=> move(idx,1)} className="px-2 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition">↓</button>
                  <button onClick={()=> remove(idx)} className="px-2 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition">X</button>
                </div>
              </div>
            ))}
            {draft.length === 0 && (
              <div className="text-sm text-gray-500 py-6">No exercises in this program yet.</div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              onClick={saveExercises}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
            >
              Save program content
            </button>
          </div>

          {/* Assign section */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={assignClientId}
                onChange={e=> setAssignClientId(e.target.value as any)}
                className="rounded-xl border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="">Assign to client</option>
                {clients.map(c=> (
                  <option key={c.id} value={c.id}>
                    {(c.firstName || '')} {(c.lastName || '')} ({c.email})
                  </option>
                ))}
              </select>
              <button
                onClick={assignToClient}
                className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}