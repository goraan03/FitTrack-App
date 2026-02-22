import { useEffect, useMemo, useState } from "react";
import type { Exercise, UpsertExercise, MuscleGroup, Equipment, Level } from "../../types/trainer/Exercise";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import { Plus, Dumbbell, Edit3, Trash2, Video, Activity, X, Save, Search } from "lucide-react";
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

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(ex =>
      ex.name.toLowerCase().includes(q) ||
      ex.muscleGroup.toLowerCase().includes(q) ||
      (ex.equipment || "").toLowerCase().includes(q) ||
      (ex.level || "").toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

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
    } catch {
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
    } catch {
      toast.error('Delete failed');
    }
  };

  const LevelBadge = ({ level }: { level: Level }) => {
    const styles: Record<Level, string> = {
      beginner: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
      intermediate: "bg-amber-400/10 text-amber-400 border-amber-400/20",
      advanced: "bg-rose-400/10 text-rose-400 border-rose-400/20",
    };
    return (
      <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-md border ${styles[level]}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="text-white">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 opacity-0 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#111118] border border-[#27273a] flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                EXERCISE <span className="text-amber-400">LIBRARY</span>
              </h1>
              <p className="text-slate-400 text-sm tracking-wide uppercase">
                Manage your workout movements
              </p>
            </div>
          </div>

          {/* Search + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full bg-[#111118] border border-[#27273a] rounded-xl
                  py-3 pl-11 pr-4 text-sm text-white
                  placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                "
              />
            </div>

            <button
              onClick={openNew}
              className="
                w-full sm:w-auto
                px-5 py-3 rounded-xl
                btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600
                text-[#0a0a0f] font-semibold
                transition-all active:scale-[0.99]
                flex items-center justify-center gap-2
              "
            >
              <Plus className="w-4 h-4" />
              NEW EXERCISE
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((ex) => (
                <div
                  key={ex.id}
                  className="
                    bg-[#111118] border border-[#27273a] rounded-2xl p-6
                    shadow-[0_18px_60px_rgba(0,0,0,0.35)]
                    card-hover
                    opacity-0 animate-fade-in-up
                  "
                  style={{ animationFillMode: "forwards" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#0a0a0f] border border-[#27273a] flex items-center justify-center">
                      <Activity className="w-5 h-5 text-amber-400" />
                    </div>

                    <LevelBadge level={ex.level} />
                  </div>

                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">
                      {ex.muscleGroup.replace("_", " ")} • {ex.equipment}
                    </p>
                  </div>

                  {ex.description ? (
                    <p className="text-sm text-slate-300/80 leading-relaxed line-clamp-3 min-h-[60px]">
                      {ex.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 italic min-h-[60px]">
                      No description
                    </p>
                  )}

                  <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-2">
                    <button
                      onClick={() => openEdit(ex)}
                      className="
                        flex-1 flex items-center justify-center gap-2
                        py-3 rounded-xl bg-white/5 hover:bg-white/10
                        text-white text-xs font-semibold uppercase tracking-wider
                        transition-all
                      "
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => del(ex.id)}
                      className="
                        w-12 h-12 rounded-xl
                        border border-rose-500/20
                        bg-rose-500/10 hover:bg-rose-500 hover:text-white
                        text-rose-400
                        flex items-center justify-center
                        transition-all
                      "
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full">
                  <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-10 text-center opacity-80">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                      No exercises found
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* bottom spacing for mobile dock */}
            <div className="h-10 md:h-0" />
          </>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#27273a] bg-[#111118] shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#0a0a0f] border border-[#27273a] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-400" />
                </span>
                {modal.editId ? "Edit" : "New"} <span className="text-amber-400">exercise</span>
              </h3>

              <button
                onClick={() => setModal((m) => ({ ...m, open: false }))}
                className="w-10 h-10 rounded-xl border border-[#27273a] text-slate-400 hover:text-white hover:bg-white/5 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5 mx-auto" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                  Exercise name
                </label>
                <input
                  value={modal.data.name}
                  onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))}
                  className="
                    w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white
                    focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                  "
                  placeholder="e.g. Bench Press"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                  Description
                </label>
                <textarea
                  value={modal.data.description || ""}
                  onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, description: e.target.value } }))}
                  className="
                    w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white min-h-[110px]
                    focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                  "
                  placeholder="Technique cues..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                    Muscle
                  </label>
                  <select
                    value={modal.data.muscleGroup}
                    onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, muscleGroup: e.target.value as any } }))}
                    className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl p-3 text-sm text-white outline-none"
                  >
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                    Equipment
                  </label>
                  <select
                    value={modal.data.equipment || "none"}
                    onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, equipment: e.target.value as any } }))}
                    className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl p-3 text-sm text-white outline-none"
                  >
                    {equipments.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">
                    Level
                  </label>
                  <select
                    value={modal.data.level || "beginner"}
                    onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, level: e.target.value as any } }))}
                    className="w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl p-3 text-sm text-white outline-none"
                  >
                    {levels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  <Video className="w-3.5 h-3.5" /> Video URL
                </label>
                <input
                  value={modal.data.videoUrl || ""}
                  onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, videoUrl: e.target.value } }))}
                  className="
                    w-full bg-[#0a0a0f] border border-[#27273a] rounded-xl px-4 py-3 text-white
                    focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
                  "
                  placeholder="https://youtube.com/..."
                />
              </div>

              <button
                onClick={save}
                className="
                  w-full py-3 rounded-xl
                  btn-glow bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600
                  text-[#0a0a0f] font-semibold
                  transition-all active:scale-[0.99]
                  flex items-center justify-center gap-2
                "
              >
                <Save className="w-4 h-4" />
                SAVE EXERCISE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}