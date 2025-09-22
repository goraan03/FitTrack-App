import { useEffect, useState } from "react";
import type { ProgramListItem, ProgramDetails, ProgramExerciseItem, UpsertProgram } from "../../types/trainer/Program";
import type { Exercise } from "../../types/trainer/Exercise";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface TrainerProgramsPageProps { trainerApi: ITrainerAPIService; }

type DraftItem = Omit<ProgramExerciseItem, 'name'>;
const emptyProgram: UpsertProgram = { title: '', description: '', level: 'beginner', isPublic: false };

export default function TrainerProgramsPage({ trainerApi }: TrainerProgramsPageProps) {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [, setDetails] = useState<ProgramDetails | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [form, setForm] = useState<UpsertProgram>(emptyProgram);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<DraftItem[]>([]);
  const [chosenExercise, setChosenExercise] = useState<number | ''>('');

  // Mobile modal editor
  const [showEditorModal, setShowEditorModal] = useState(false);
  const isMobile = () => (typeof window !== "undefined" ? window.innerWidth < 1024 : false);

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

  // responsive open handlers
  const openNewResponsive = () => {
    setSelected(null);
    if (isMobile()) setShowEditorModal(true);
  };
  const openEditResponsive = (id: number) => {
    setSelected(id);
    if (isMobile()) setShowEditorModal(true);
  };

  // Reusable editor content
  const inputBase = "mt-1 w-full border rounded px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:ring-inset focus:border-yellow-400";
  const selectBase = "rounded-xl border px-3 py-2 bg-white text-black focus:ring-2 focus:ring-yellow-400 focus:ring-inset focus:border-yellow-400";

  const EditorContent = (
    <>
      <div className="grid gap-4">
        <div>
          <label className="text-xs text-gray-600 uppercase">Title</label>
          <input
            value={form.title}
            onChange={e=> setForm(f=>({...f,title:e.target.value}))}
            className={inputBase}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 uppercase">Description</label>
          <textarea
            value={form.description||''}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            className={`${inputBase} min-h-[90px]`}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <select
            value={form.level}
            onChange={e=> setForm(f=>({...f,level:e.target.value as any}))}
            className={selectBase}
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={!!form.isPublic} onChange={e=>setForm(f=>({...f,isPublic:e.target.checked}))} className="h-4 w-4 accent-yellow-400"/>
            Public
          </label>
          <button onClick={saveProgram} disabled={saving} className="ml-auto px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
            {selected ? 'Save' : 'Create'}
          </button>
        </div>
      </div>

      <div className="my-6 border-t"/>

      <div className="flex gap-3">
        <select value={chosenExercise} onChange={e=> setChosenExercise(e.target.value as any)} className={selectBase}>
          <option value="">Pick exercise</option>
          {exercises.map(e=> <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <button onClick={addDraft} className="px-3 py-2 border rounded hover:bg-gray-100">Add</button>
      </div>

      <div className="mt-4 space-y-3">
        {draft.map((it,idx)=>(
          <div key={idx} className="p-4 border rounded-xl bg-white/60 text-black">
            <div className="font-medium text-black">{it.position}. {exerciseName(it.exerciseId)}</div>
            <div className="mt-2 flex gap-1">
              <button onClick={()=> move(idx,-1)} className="px-2 py-1 border rounded hover:bg-gray-100">↑</button>
              <button onClick={()=> move(idx,1)} className="px-2 py-1 border rounded hover:bg-gray-100">↓</button>
              <button onClick={()=> remove(idx)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">X</button>
            </div>
          </div>
        ))}
        {draft.length===0 && <div className="text-sm text-gray-500">No exercises in this program yet.</div>}
      </div>

      <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <select
          value={assignClientId}
          onChange={e=>setAssignClientId(e.target.value as any)}
          className={`${selectBase} w-full sm:w-auto flex-1 min-w-0`}
        >
          <option value="">Assign to client</option>
          {clients.map(c=> <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
        </select>
        <button onClick={assignToClient} className="px-3 py-2 border rounded hover:bg-gray-100 sm:self-auto self-start">
          Assign
        </button>
      </div>
    </>
  );

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_200px_at_10%_0%,rgba(253,224,71,0.06),transparent),radial-gradient(500px_200px_at_90%_10%,rgba(253,224,71,0.04),transparent)]" />
      <h1 className="relative text-3xl font-bold text-white">Programs</h1>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: list */}
        <div className="bg-white/90 text-black rounded-2xl border border-gray-200 shadow p-5 lg:sticky lg:top-24 h-fit backdrop-blur-sm">
          <div className="flex justify-between">
            <h3 className="font-semibold text-black">My Programs</h3>
            <button onClick={openNewResponsive} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100">New</button>
          </div>
          <div className="mt-3 divide-y divide-gray-100 max-h-[70vh] overflow-y-auto pr-1">
            {programs.map(p => (
              <div
                key={p.id}
                onClick={()=> setSelected(p.id)}
                className={`w-full text-left py-3 px-3 rounded-xl border transition ${selected===p.id ? 'bg-yellow-100 border-yellow-300' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-black truncate">{p.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.level} {p.isPublic ? '• public' : ''}</div>
                  </div>
                  <button
                    onClick={(e)=> { e.stopPropagation(); openEditResponsive(p.id); }}
                    className="lg:hidden ml-2 px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
            {programs.length===0 && <div className="text-sm text-gray-500 py-8 text-center">No programs yet.</div>}
          </div>
        </div>

        {/* Right: editor (desktop) */}
        <div className="hidden lg:block bg-white/90 text-black rounded-2xl border border-gray-200 shadow p-5 lg:col-span-2 backdrop-blur-sm">
          {EditorContent}
        </div>
      </div>

      {/* Modal editor (mobile) – header izvan scroll, sadržaj skroluje i ne “curi” van ivica */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
          <div className="bg-white text-black w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">{selected ? "Edit Program" : "New Program"}</h3>
              <button onClick={()=> setShowEditorModal(false)} className="px-3 py-1.5 rounded-lg border hover:bg-gray-100">Close</button>
            </div>
            <div className="max-h-[85vh] overflow-y-auto p-5">
              {EditorContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}