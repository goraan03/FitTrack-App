import { useEffect, useState, useMemo } from "react";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";
import { History as HistoryIcon, Calendar, User, Dumbbell, Star, Download, TrendingUp, Search, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsContext";
import { format, isSameMonth, isSameWeek } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ClientHistoryPageProps {
  clientApi: IClientAPIService;
}

export default function ClientHistoryPage({ clientApi }: ClientHistoryPageProps) {
  const { t } = useSettings();
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; avgRating: number | null }>({ total: 0, avgRating: null });
  const [loading, setLoading] = useState(true);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");

  // Modal state
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const normalizeItems = (raw: any[] = []) =>
    raw
      .map((item) => {
        const parsedDate = new Date(item.date);
        return { ...item, parsedDate };
      })
      // Invalid/empty dates from API previously crashed the page (date-fns format throws on Invalid Date)
      .filter((item) => !Number.isNaN(item.parsedDate.getTime()));

  const load = async () => {
    try {
      setLoading(true);
      const resp = await clientApi.getHistory();
      if (resp.success && resp.data) {
        setItems(normalizeItems(resp.data.items));
        setStats(resp.data.stats || { total: 0, avgRating: null });
      }
    } catch (err: any) {
      toast.error(err?.message || t("failed_to_load_history"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const programs = useMemo(() => {
    const progs = new Set<string>();
    items.forEach(i => progs.add(i.programTitle));
    return ["All", ...Array.from(progs)];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Program filter
    if (selectedProgram !== "All") {
      result = result.filter(i => i.programTitle === selectedProgram);
    }

    // Time filter
    const now = new Date();
    if (timeFilter === "week") {
      result = result.filter(i => isSameWeek(i.parsedDate, now, { weekStartsOn: 1 }));
    } else if (timeFilter === "month") {
      result = result.filter(i => isSameMonth(i.parsedDate, now));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.programTitle.toLowerCase().includes(q) ||
        i.trainerName.toLowerCase().includes(q) ||
        i.exercises.some((ex: any) => ex.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, selectedProgram, timeFilter, searchQuery]);

  const chartData = useMemo(() => {
    // Only show chart when a specific program is selected to track progress accurately
    if (selectedProgram === "All" || filteredItems.length < 2) return null;

    const sortedItems = [...filteredItems].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    return sortedItems.map(session => {
      let volume = 0;
      session.exercises.forEach((ex: any) => {
        ex.sets.forEach((s: any) => {
          volume += (Number(s.reps) || 0) * (Number(s.weight) || 0);
        });
      });
      return {
        date: format(session.parsedDate, "dd MMM"),
        volume
      };
    });
  }, [filteredItems, selectedProgram]);

  const handleDownloadPdf = async (sessionId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const blob = await clientApi.downloadWorkoutPdf(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WorkoutReport_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(t("pdf_downloaded") || "PDF downloaded");
    } catch (err: any) {
      toast.error(t("failed_to_download_pdf") || "Failed to download PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="bg-[#111118] border border-[#27273a] rounded-2xl px-6 py-4 flex items-center gap-3 shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
          <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-sm uppercase tracking-widest text-slate-400 font-semibold">{t("loading_history")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-20 space-y-8">
        {/* Header + stats */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                {t("workout_history").toUpperCase()}
              </h1>
              <p className="text-slate-400 text-xs uppercase tracking-[0.25em] mt-1">{t("history_subtitle")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="stat-card-1 rounded-2xl p-5 text-left shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-1">{t("sessions")}</p>
              <div className="text-3xl font-black">{filteredItems.length ?? 0}</div>
            </div>
            <div className="stat-card-2 rounded-2xl p-5 text-left shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-1">{t("avg_rating")}</p>
              <div className="flex items-center gap-2 text-3xl font-black">
                <span>{stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}</span>
                <Star className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards", animationDelay: "0.05s" }}>
          <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={t("search_history") || "Search by title, trainer or exercise..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-black/30 text-white placeholder:text-slate-500 pl-11 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {(["all", "month", "week"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-colors ${timeFilter === tf
                      ? "bg-amber-400 text-black border-amber-400"
                      : "border-white/5 bg-black/30 text-slate-300 hover:border-amber-400/30 hover:text-white"
                    }`}
                >
                  {tf === "all" ? t("all_time") : tf === "month" ? t("this_month") : t("this_week")}
                </button>
              ))}

              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="rounded-xl border border-white/5 bg-black/30 text-white px-4 py-3 text-sm font-semibold pr-9 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40 appearance-none"
                >
                  {programs.map(p => (
                    <option key={p} value={p}>
                      {p === "All" ? t("all_programs") || "All Programs" : p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData && chartData.length > 0 && (
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 shadow-[0_18px_55px_rgba(0,0,0,0.55)] opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">{t("volume_progress") || "Volume Progress"}</h3>
                <p className="text-slate-500 text-[11px] uppercase tracking-widest">{selectedProgram}</p>
              </div>
            </div>
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94a3b8' }}
                    dy={8}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111118', borderColor: '#27273a', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#fbbf24', stroke: '#111118', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards", animationDelay: "0.12s" }}>
          {filteredItems.length === 0 ? (
            <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-12 text-center shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
              <div className="text-6xl mb-3">🗂️</div>
              <div className="text-slate-300 font-black uppercase tracking-widest text-sm">{t("no_sessions_recorded")}</div>
              <div className="text-slate-500 text-sm mt-2">{t("no_sessions_recorded_subtitle")}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((session, idx) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="bg-[#111118] border border-[#27273a] rounded-2xl p-5 sm:p-6 card-hover shadow-[0_18px_55px_rgba(0,0,0,0.55)] cursor-pointer opacity-0 animate-fade-in-up"
                  style={{ animationFillMode: "forwards", animationDelay: `${0.05 * idx}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-black/30 border border-white/5 flex flex-col items-center justify-center text-amber-300">
                        <Calendar className="w-4 h-4 mb-0.5" />
                        <span className="text-[10px] font-black uppercase tracking-tight">{format(session.parsedDate, "dd MMM")}</span>
                      </div>
                      <div>
                        <div className="text-lg font-black uppercase tracking-tight leading-tight line-clamp-1">
                          {session.programTitle || t("training")}
                        </div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span className="truncate">{session.trainerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                      {format(session.parsedDate, "HH:mm")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 text-sm">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold uppercase tracking-wider text-xs">{session.exercises.length} {t("exercises")}</span>
                    </div>
                    <button
                      onClick={(e) => handleDownloadPdf(session.id, e)}
                      className="px-3 py-2 rounded-xl border border-white/5 bg-black/30 text-slate-300 hover:border-amber-400/40 hover:text-amber-300 transition-colors"
                      title={t("download_pdf") || "Download Report"}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedSession(null)} />
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 shadow-[0_30px_90px_rgba(0,0,0,0.7)] animate-fade-in-up flex flex-col">
            <div className="p-6 sm:p-7 flex items-start justify-between border-b border-[#27273a]">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-black/30 border border-white/5 flex flex-col items-center justify-center text-amber-300">
                  <Calendar className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-tight">{format(selectedSession.parsedDate, "dd MMM")}</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    {selectedSession.programTitle || t("training")}
                  </h2>
                  <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    {selectedSession.trainerName}
                    <span className="text-slate-600">•</span>
                    {format(selectedSession.parsedDate, "HH:mm")}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 rounded-full bg-black/30 border border-white/5 text-slate-300 hover:text-white hover:border-amber-400/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-4">
              {selectedSession.exercises.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">{t("no_exercises_in_session") || "No exercises recorded for this session."}</div>
              ) : (
                selectedSession.exercises.map((ex: any) => (
                  <div key={ex.exerciseId} className="bg-black/20 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h4 className="font-black uppercase tracking-tight text-sm">{ex.name}</h4>
                    </div>
                    <div className="space-y-2">
                      {ex.sets.map((set: any) => (
                        <div key={set.setNumber} className="flex items-center justify-between bg-[#111118] border border-[#27273a] px-4 py-2.5 rounded-lg text-[11px]">
                          <span className="text-slate-500 font-black uppercase tracking-[0.25em]">{t("set")} {set.setNumber}</span>
                          <div className="font-black text-white flex items-center gap-2">
                            <span>{set.reps}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{t("reps")}</span>
                            <span className="w-1 h-3 bg-amber-400/30 rounded-full" />
                            <span>{set.weight}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 sm:p-7 border-t border-[#27273a] bg-[#0d0d14]">
              <button
                onClick={(e) => handleDownloadPdf(selectedSession.id, e)}
                className="flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-black px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                {t("download_pdf") || "Download Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
