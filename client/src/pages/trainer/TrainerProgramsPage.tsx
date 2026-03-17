import { useEffect, useState, useMemo } from "react";
import type { ProgramListItem, ProgramDetails, ProgramExerciseItem, UpsertProgram } from "../../types/trainer/Program";
import type { Exercise, MuscleGroup } from "../../types/trainer/Exercise";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import {
  Plus,
  Save,
  Trash2,
  ChevronUp,
  ChevronDown,
  Users,
  Dumbbell,
  X,
  Layout,
  Search,
  Filter,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsContext";

interface TrainerProgramsPageProps { trainerApi: ITrainerAPIService; }

type DraftItem = Omit<ProgramExerciseItem, "name">;
const emptyProgram: UpsertProgram = { title: "", description: "", level: "beginner", isPublic: false };
const groups: MuscleGroup[] = ['full_body', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'mobility'];

export default function TrainerProgramsPage({ trainerApi }: TrainerProgramsPageProps) {
  const { t } = useSettings();
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [details, setDetails] = useState<ProgramDetails | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [form, setForm] = useState<UpsertProgram>(emptyProgram);
  const [saving, setSaving] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClientId, setFilterClientId] = useState<number | "">("");

  const [draft, setDraft] = useState<DraftItem[]>([]);
  const [chosenExercise, setChosenExercise] = useState<number | "">("");
  const [exerciseSearch,] = useState("");
  const [exerciseGroup, setExerciseGroup] = useState<MuscleGroup | "">("");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClientId, setAssignClientId] = useState<number | "">("");
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
        description: d.data.description || "",
        level: d.data.level,
        isPublic: false,
      });
      setDraft(
        d.data.exercises.map((x) => ({
          exerciseId: x.exerciseId,
          position: x.position,
          sets: x.sets,
          reps: x.reps,
          tempo: x.tempo,
          restSec: x.restSec,
          notes: x.notes,
        }))
      );
    }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (selected) { loadDetails(selected); }
    else { setDetails(null); setDraft([]); setForm(emptyProgram); }
  }, [selected]);

  const filteredExercises = useMemo(() => {
    const q = exerciseSearch.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchesSearch = !q || e.name.toLowerCase().includes(q);
      const matchesGroup = !exerciseGroup || e.muscleGroup === exerciseGroup;
      return matchesSearch && matchesGroup;
    });
  }, [exercises, exerciseSearch, exerciseGroup]);

  // Client Filter & Search Logic
  const filteredPrograms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return programs.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(q);
      const matchesClient =
        !filterClientId ||
        (p.assignedClientIds && p.assignedClientIds.includes(Number(filterClientId)));

      return matchesSearch && matchesClient;
    });
  }, [programs, searchTerm, filterClientId]);

  const addDraft = () => {
    const exId = Number(chosenExercise);
    if (!exId) return toast.error(t('pick_exercise') || "Pick an exercise first");
    const pos = draft.length + 1;
    setDraft((d) => [
      ...d,
      { exerciseId: exId, position: pos, sets: 3, reps: "10", tempo: null, restSec: 60, notes: null },
    ]);
    setChosenExercise("");
  };

  const move = (index: number, dir: -1 | 1) => {
    const arr = [...draft];
    const ni = index + dir;
    if (ni < 0 || ni >= arr.length) return;
    const tmp = arr[index]; arr[index] = arr[ni]; arr[ni] = tmp;
    arr.forEach((it, i) => (it.position = i + 1));
    setDraft(arr);
  };

  const remove = (index: number) => {
    const arr = draft.filter((_, i) => i !== index);
    arr.forEach((it, i) => (it.position = i + 1));
    setDraft(arr);
  };

  const updateDraftItem = (index: number, field: keyof DraftItem, value: any) => {
    const arr = [...draft];
    arr[index] = { ...arr[index], [field]: value };
    setDraft(arr);
  };

  const saveProgram = async () => {
    if (!form.title.trim()) return toast.error(t('title') + " " + t('is_required'));
    setSaving(true);
    try {
      let programId = selected;
      if (!programId) {
        const res = await trainerApi.createProgram(form);
        if (!res.success) return toast.error(res.message || "Failed to create");
        programId = res.data.id;
        setSelected(programId);
        toast.success(t('program_saved'));
        await loadAll();
      } else {
        const res = await trainerApi.updateProgram(programId, form);
        if (!res.success) return toast.error(res.message || "Failed to update");
        toast.success(t('program_saved'));
        await loadAll();
      }
      if (programId && draft.length >= 0) {
        const resEx = await trainerApi.setProgramExercises(programId, draft);
        if (!resEx.success) return toast.error(resEx.message || "Failed to save exercises");
        await loadDetails(programId);
      }
    } finally {
      setSaving(false);
    }
  };

  const assignToClient = async () => {
    if (!selected) return;
    const cid = Number(assignClientId);
    if (!cid) return toast.error(t('pick_client'));
    setAssigning(true);
    try {
      const res = await trainerApi.assignProgramToClient(selected, cid);
      if (res.success) {
        toast.success(t('assigned_to') + " " + t('client'));
        setShowAssignModal(false);
        await loadDetails(selected);
      } else toast.error(res.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const exerciseName = (id: number) => exercises.find((x) => x.id === id)?.name || `Exercise #${id}`;

  const levelStyles: Record<"beginner" | "intermediate" | "advanced", string> = {
    beginner: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    intermediate: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    advanced: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  };

  return (
    <div className="text-white">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto opacity-0 animate-fade-in-up">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 opacity-0 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#111118] border border-[#27273a] flex items-center justify-center">
              <Layout className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 uppercase">
                {t('training_programs')}
              </h1>
              <p className="text-slate-400 text-sm tracking-wide uppercase">
                {t('build_and_manage')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={t('Search Programs')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full bg-[#111118] border border-[#27273a] rounded-xl
                  py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                "
              />
            </div>

            {/* Filter */}
            <div className="relative w-full sm:w-[180px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={filterClientId}
                onChange={(e) => setFilterClientId(e.target.value as any)}
                className="
                  w-full bg-[#111118] border border-[#27273a] rounded-xl
                  py-3 pl-11 pr-4 text-sm text-white
                  focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                  appearance-none cursor-pointer
                "
              >
                <option value="">{t('All Clients')}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Button */}
            <button
              onClick={() => {
                setSelected(null);
                if (window.innerWidth < 1024) setMobileEditorOpen(true);
              }}
              className="
                w-full sm:w-auto px-5 py-3 rounded-xl
                btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600
                text-[#0a0a0f] font-bold text-sm
                transition-all active:scale-[0.99]
                flex items-center justify-center gap-2
              "
            >
              <Plus className="w-4 h-4" />
              {t('create_program').toUpperCase()}
            </button>
          </div>
        </div>

        {/* ========================= */}
        {/* MOBILE (list only)        */}
        {/* ========================= */}
        <div className="lg:hidden space-y-4">
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] p-3 custom-scrollbar space-y-2 opacity-0 animate-fade-in-up stagger-2">
            {filteredPrograms.length === 0 ? (
              <div className="p-10 text-center opacity-80">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  {t('no_programs_found_msg').split(' ')[0] || "Empty"}
                </p>
              </div>
            ) : (
              filteredPrograms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected(p.id);
                    setMobileEditorOpen(true);
                  }}
                  className={`
                  w-full text-left p-5 rounded-2xl transition-all border
                  bg-[#0a0a0f] border-[#27273a] hover:border-white/15 hover:bg-white/5
                `}
                >
                  <h4 className="font-semibold text-sm text-white truncate">
                    {p.title}
                  </h4>
                  <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 mt-2 inline-block rounded-md border ${levelStyles[p.level]}`}>
                    {t(p.level)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* DESKTOP (original 2-col)  */}
        {/* ========================= */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-4 opacity-0 animate-fade-in-up stagger-1">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                List ({filteredPrograms.length})
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="
                w-10 h-10 rounded-xl
                bg-[#111118] border border-[#27273a]
                hover:bg-white/5 hover:border-white/20
                transition-all
                flex items-center justify-center
              "
                title={t('create_program')}
              >
                <Plus className="w-5 h-5 text-amber-400" />
              </button>
            </div>

            <div className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] p-3 max-h-[520px] overflow-y-auto custom-scrollbar space-y-2">
              {filteredPrograms.length === 0 ? (
                <div className="p-10 text-center opacity-80">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                    {t('no_programs_found_msg').split(' ')[0] || "Empty"}
                  </p>
                </div>
              ) : (
                filteredPrograms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className={`
                    w-full text-left p-5 rounded-2xl transition-all border
                    ${selected === p.id
                        ? "bg-amber-400/10 border-amber-400/25"
                        : "bg-[#0a0a0f] border-[#27273a] hover:border-white/15 hover:bg-white/5"}
                  `}
                  >
                    <h4 className="font-semibold text-sm text-white truncate">{p.title}</h4>
                    <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 mt-2 inline-block rounded-md border ${levelStyles[p.level]}`}>
                      {p.level}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* MAIN */}
          <div className="lg:col-span-8 space-y-8">
            {/* Assigned clients */}
            {selected && details && (
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/15 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                      {t('assigned_to')}
                    </h3>
                    <p className="text-sm font-semibold text-white mt-1">
                      {details.assignedClients && details.assignedClients.length > 0
                        ? details.assignedClients.map((c) => `${c.firstName} ${c.lastName}`).join(", ")
                        : t('no_clients_assigned')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-xs font-semibold uppercase tracking-widest text-cyan-300 hover:text-white transition-colors"
                >
                  + {t('ADD')}
                </button>
              </div>
            )}

            {/* Editor */}
            <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                      {t('title')}
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="
                      w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white
                      focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                    "
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                      {t('difficulty')}
                    </label>
                    <select
                      value={form.level}
                      onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as any }))}
                      className="
                      w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white
                      focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                      appearance-none cursor-pointer
                    "
                    >
                      <option value="beginner">{t('beginner')}</option>
                      <option value="intermediate">{t('intermediate')}</option>
                      <option value="advanced">{t('advanced')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                    {t('description')}
                  </label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="
                    w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white min-h-[110px]
                    focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                  "
                  />
                </div>

                <div className="pt-5 border-t border-white/5 flex items-center justify-end">
                  <button
                    onClick={saveProgram}
                    disabled={saving}
                    className="
                    px-6 py-3 rounded-xl
                    btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600
                    text-[#0a0a0f] font-semibold
                    transition-all disabled:opacity-40 active:scale-[0.99]
                    flex items-center gap-2
                  "
                  >
                    <Save className="w-4 h-4" />
                    {saving ? `${t('saving')}...` : selected ? t('update').toUpperCase() : t('create_program').toUpperCase()}
                  </button>
                </div>
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full" />
                <h2 className="text-xl font-bold text-white">
                  {t('exercises').toUpperCase()} <span className="text-slate-400 font-semibold">({draft.length})</span>
                </h2>
              </div>

              <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={exerciseGroup}
                      onChange={(e) => setExerciseGroup(e.target.value as any)}
                      className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 appearance-none cursor-pointer"
                    >
                      <option value="">{t('All Groups')}</option>
                      {groups.map((g) => (
                        <option key={g} value={g}>{t(g)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={chosenExercise}
                    onChange={(e) => setChosenExercise(e.target.value as any)}
                    className="
                    flex-1 bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white
                    focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                    appearance-none cursor-pointer
                  "
                  >
                    <option value="">{t('pick_exercise')}</option>
                    {filteredExercises.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={addDraft}
                    className="
                    px-5 py-3 rounded-xl
                    bg-white/5 hover:bg-white/10
                    border border-white/10 hover:border-white/20
                    text-white font-semibold
                    transition-all
                    flex items-center justify-center gap-2
                  "
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    {t('Add More').toUpperCase()}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {draft.map((item, idx) => (
                  <div
                    key={idx}
                    className="
                    group bg-[#111118] border border-[#27273a] rounded-2xl p-5 sm:p-6
                    shadow-[0_18px_60px_rgba(0,0,0,0.30)]
                    hover:border-white/15 transition-all
                  "
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex md:flex-col items-center md:items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#0a0a0f] border border-[#27273a] flex items-center justify-center">
                          <span className="text-base font-bold text-white">{item.position}</span>
                        </div>
                        <div className="flex md:flex-col gap-2">
                          <button
                            onClick={() => move(idx, -1)}
                            disabled={idx === 0}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 transition flex items-center justify-center"
                            title={t('move_up')}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => move(idx, 1)}
                            disabled={idx === draft.length - 1}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 transition flex items-center justify-center"
                            title={t('move_down')}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {exerciseName(item.exerciseId)}
                          </h4>
                          <button
                            onClick={() => remove(idx)}
                            className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition flex items-center justify-center"
                            title={t('remove')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {(["sets", "reps", "tempo", "restSec"] as const).map((field) => (
                            <div key={field} className="space-y-1">
                              <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                                {field === "restSec" ? t('rest_s') : t(field)}
                              </label>
                              <input
                                value={(item as any)[field] || ""}
                                onChange={(e) =>
                                  updateDraftItem(
                                    idx,
                                    field as any,
                                    field === "sets" || field === "restSec"
                                      ? Number(e.target.value)
                                      : e.target.value
                                  )
                                }
                                className="
                                w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-sm text-white
                                focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                              "
                              />
                            </div>
                          ))}
                        </div>

                        <input
                          placeholder={`${t('notes')}...`}
                          value={item.notes || ""}
                          onChange={(e) => updateDraftItem(idx, "notes", e.target.value)}
                          className="
                          w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-sm text-white
                          focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                        "
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-10 md:h-0" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MODAL — IZVUČEN VAN SVIH WRAPPER DIVOVA */}
      {mobileEditorOpen && (
        <div className="fixed inset-0 z-[150]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileEditorOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-[#27273a] bg-[#0a0a0f] shadow-[0_-30px_100px_rgba(0,0,0,0.9)] opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">

            <div className="flex items-center justify-between px-6 pt-6 pb-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80 font-bold mb-1">
                  {selected ? t('edit_program').toUpperCase() : t('create_program').toUpperCase()}
                </div>
                <div className="text-lg font-bold text-white truncate max-w-[220px]">
                  {form.title?.trim() ? form.title : selected ? t('program') : t('New Program')}
                </div>
              </div>
              <button
                className="w-10 h-10 rounded-xl bg-white/5 border border-[#27273a] text-slate-400 hover:text-white transition flex items-center justify-center"
                onClick={() => setMobileEditorOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-10 space-y-8">
              {selected && details && (
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-cyan-500/15 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">{t('assigned_to')}</h3>
                      <p className="text-sm font-semibold text-white mt-1">
                        {details.assignedClients && details.assignedClients.length > 0
                          ? details.assignedClients.map((c) => `${c.firstName} ${c.lastName}`).join(", ")
                          : t('no_clients_assigned')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="text-xs font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap"
                  >
                    + {t('Add More')}
                  </button>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('title')}</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full bg-[#111118] border border-[#27273a] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('difficulty')}</label>
                  <div className="relative">
                    <select
                      value={form.level}
                      onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as any }))}
                      className="w-full bg-[#111118] border border-[#27273a] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40 appearance-none cursor-pointer text-sm"
                    >
                      <option value="beginner">{t('beginner')}</option>
                      <option value="intermediate">{t('intermediate')}</option>
                      <option value="advanced">{t('advanced')}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t('description')}</label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full bg-[#111118] border border-[#27273a] rounded-xl px-4 py-3.5 text-white min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={saveProgram}
                  disabled={saving}
                  className="w-full py-3.5 rounded-xl btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f] font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? `${t('saving')}...` : selected ? t('update_program') : t('create_program')}
                </button>
              </div>

              <div className="space-y-5 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                    {t('exercises')} <span className="text-slate-500 ml-1">({draft.length})</span>
                  </h2>
                </div>

                <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-5 space-y-4">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <select
                      value={exerciseGroup}
                      onChange={(e) => setExerciseGroup(e.target.value as any)}
                      className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400/20 appearance-none"
                    >
                      <option value="">{t('All Groups')}</option>
                      {groups.map((g) => (
                        <option key={g} value={g}>{t(g)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <select
                      value={chosenExercise}
                      onChange={(e) => setChosenExercise(e.target.value as any)}
                      className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400/20 appearance-none"
                    >
                      <option value="">{t('pick_exercise')}</option>
                      {filteredExercises.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>

                  <button
                    onClick={addDraft}
                    className="w-full py-3 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('Add to Program').toUpperCase()}
                  </button>
                </div>

                <div className="space-y-4">
                  {draft.map((item, idx) => (
                    <div key={idx} className="bg-[#111118] border border-[#27273a] rounded-2xl p-5 hover:border-white/10 transition-all">
                      <div className="flex flex-col gap-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#27273a] flex items-center justify-center font-bold text-amber-400">
                              {item.position}
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 flex items-center justify-center transition">
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => move(idx, 1)} disabled={idx === draft.length - 1} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 flex items-center justify-center transition">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <button onClick={() => remove(idx)} className="w-10 h-10 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <h4 className="text-base font-bold text-white uppercase tracking-tight">
                          {exerciseName(item.exerciseId)}
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          {(["sets", "reps", "tempo", "restSec"] as const).map((field) => (
                            <div key={field} className="space-y-1.5">
                              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
                                {field === "restSec" ? t('rest_s') : t(field)}
                              </label>
                              <input
                                value={(item as any)[field] || ""}
                                onChange={(e) => updateDraftItem(idx, field as any, field === "sets" || field === "restSec" ? Number(e.target.value) : e.target.value)}
                                className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">{t('notes')}</label>
                          <input
                            placeholder={`${t('Add Notes')}...`}
                            value={item.notes || ""}
                            onChange={(e) => updateDraftItem(idx, "notes", e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400/30"
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
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#27273a] bg-[#111118] shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-300" />
                </span>
                {t('assign_program')}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-10 h-10 rounded-xl border border-[#27273a] text-slate-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5 mx-auto" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                  {t('pick_client')}
                </label>
                <select
                  value={assignClientId}
                  onChange={(e) => setAssignClientId(e.target.value as any)}
                  className="
                  w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/40
                  appearance-none cursor-pointer
                "
                >
                  <option value="">{t('pick_client')}</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={assignToClient}
                disabled={!assignClientId || assigning}
                className="
                w-full py-3 rounded-xl
                bg-cyan-500/15 hover:bg-cyan-500/25
                border border-cyan-500/25
                text-white font-semibold
                transition-all disabled:opacity-40 active:scale-[0.99]
              "
              >
                {assigning ? `${t('saving')}...` : t('confirm_assignment').toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 999px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(250, 204, 21, 0.35); }
    `}</style>
    </div>
  );
}