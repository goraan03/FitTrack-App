import { useEffect, useState } from "react";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";
import { History as HistoryIcon, Calendar, User, ChevronDown, Dumbbell, Activity, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsContext";
import { format } from "date-fns";

interface ClientHistoryPageProps {
  clientApi: IClientAPIService;
}

export default function ClientHistoryPage({ clientApi }: ClientHistoryPageProps) {
  const { t } = useSettings();
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; avgRating: number | null }>({ total: 0, avgRating: null });
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});

  const load = async () => {
    try {
      setLoading(true);
      const resp = await clientApi.getHistory();
      if (resp.success && resp.data) {
        setItems(resp.data.items || []);
        setStats(resp.data.stats || { total: 0, avgRating: null });
      }
    } catch (err: any) {
      toast.error(err?.message || t("failed_to_load_history"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = (id: number) => {
    setExpandedSessions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[var(--bg-app)]">
        <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
        <p className="text-[var(--text-muted)] uppercase tracking-[0.2em] text-[10px] font-black animate-pulse">{t("loading_history")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-12">
        <div className="fixed top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
                <HistoryIcon className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">
                  {t("workout_history").split(' ')[0]} <span className="text-amber-500">{t("workout_history").split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-[var(--text-muted)] font-bold tracking-widest text-[10px] uppercase mt-1">
                  {t("history_subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] px-8 py-5 rounded-[2rem] text-center min-w-[140px] shadow-lg group hover:border-amber-500/30 transition-all duration-500">
              <span className="block text-4xl font-black text-[var(--text-main)] group-hover:scale-110 transition-transform duration-500">{stats.total}</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mt-1 block italic">{t("sessions")}</span>
            </div>
            <div className="bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] px-8 py-5 rounded-[2rem] text-center min-w-[140px] shadow-lg group hover:border-cyan-500/30 transition-all duration-500">
              <div className="flex items-center justify-center gap-2 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                <span className="text-4xl font-black">{stats.avgRating?.toFixed(1) || '—'}</span>
                <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mt-1 block italic">{t("avg_rating")}</span>
            </div>
          </div>
        </div>

        {/* HISTORY LIST */}
        <div className="space-y-6 relative z-10">
          {items.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-24 text-center opacity-0 animate-[fade-in-up_0.6s_ease-out_0.2s_forwards] shadow-xl">
              <div className="w-20 h-20 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-color)]">
                <Activity className="w-10 h-10 text-[var(--text-muted)] opacity-20" />
              </div>
              <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight italic">{t("no_sessions_recorded")}</h3>
              <p className="text-[var(--text-muted)] text-xs mt-3 max-w-sm mx-auto font-bold leading-relaxed">{t("no_sessions_recorded_subtitle")}</p>
            </div>
          ) : (
            items.map((session, idx) => {
              const isExpanded = expandedSessions[session.id];
              return (
                <div
                  key={session.id}
                  className={`group bg-[var(--bg-card)] hover:bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden transition-all duration-500 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] shadow-sm hover:shadow-2xl hover:-translate-y-1 ${isExpanded ? 'ring-2 ring-amber-500/20' : ''}`}
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'forwards' }}
                >
                  {/* Session Summary Card */}
                  <button
                    onClick={() => toggleExpand(session.id)}
                    className="w-full p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-[var(--bg-app)] border border-[var(--border-color)] flex flex-col items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors duration-500 shadow-inner">
                        <Calendar className="w-6 h-6 text-amber-500 mb-1.5" />
                        <span className="text-[11px] font-black uppercase text-[var(--text-main)] tracking-tighter">
                          {format(new Date(session.date), "dd MMM")}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter group-hover:text-amber-500 transition-colors duration-300 italic">
                          {session.programTitle || t("training")}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.1em]">
                            <User className="w-4 h-4 text-amber-500/60" />
                            {session.trainerName}
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]" />
                          <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            {format(new Date(session.date), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 relative z-10 ml-auto sm:ml-0">
                      <div className="px-6 py-2.5 bg-amber-500/5 border border-amber-500/20 rounded-full shadow-sm">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          {session.exercises.length} {t("exercises")}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-color)] transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-amber-500/10 border-amber-500/30' : ''}`}>
                        <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-amber-500' : 'text-[var(--text-muted)]'}`} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-8 pb-10 space-y-8 animate-[fade-in_0.5s_ease-out]">
                      <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {session.exercises.map((ex: any) => (
                          <div key={ex.exerciseId} className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[2rem] p-6 space-y-6 hover:border-amber-500/20 transition-colors shadow-inner">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-sm">
                                <Dumbbell className="w-5 h-5 text-amber-500" />
                              </div>
                              <h4 className="font-black text-[var(--text-main)] text-sm uppercase tracking-tight italic">{ex.name}</h4>
                            </div>

                            <div className="space-y-3">
                              {ex.sets.map((set: any) => (
                                <div key={set.setNumber} className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] px-5 py-3 rounded-2xl text-[10px] hover:scale-[1.02] transition-transform duration-300">
                                  <span className="text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">{t("set")} {set.setNumber}</span>
                                  <div className="font-black text-[var(--text-main)] flex items-center gap-1.5">
                                    <span className="text-sm">{set.reps}</span>
                                    <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest">{t("reps")}</span>
                                    <span className="w-1 h-3 bg-amber-500/20 rounded-full mx-1" />
                                    <span className="text-sm">{set.weight}</span>
                                    <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest">kg</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}