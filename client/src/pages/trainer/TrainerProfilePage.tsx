import { useEffect, useState, useMemo } from "react";
import { Avatar } from "../../components/client/Avatar";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { TrainerProfile } from "../../types/trainer/TrainerProfile";
import { User, Mail, MapPin, Calendar, Award, Activity, TrendingUp, Clock, Edit3 } from "lucide-react";

export default function TrainerProfilePage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const [data, setData] = useState<TrainerProfile|null>(null);
  const [loading, setLoading] = useState(true);
  const [, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await trainerApi.getMyProfile();
        if (r.success) setData(r.data);
        else setErr(r.message);
      } catch (e: any) {
        setErr(e?.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [trainerApi]);

  const fullName = useMemo(() => 
    data ? `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email : "", 
    [data]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-12">
        {/* HERO */}
        <div className="bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.40)] overflow-hidden opacity-0 animate-fade-in-up">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative self-center sm:self-auto">
                <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-10 rounded-full" />
                <div className="relative ring-2 ring-amber-400/25 rounded-full p-1 bg-[#0a0a0f]">
                  <Avatar name={fullName} src={data?.avatarUrl ?? null} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate">
                  {fullName}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="inline-flex items-center justify-center sm:justify-start gap-2 text-amber-300 text-[11px] font-semibold uppercase tracking-widest">
                    <Award className="w-4 h-4 text-amber-400" />
                    Certified Trainer
                  </p>

                  <span className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full" />

                  <p className="text-slate-400 text-sm font-medium break-all sm:break-normal">
                    {data?.email}
                  </p>
                </div>
              </div>

              {/* Edit button */}
              <button
                className="
                  w-full sm:w-auto px-6 py-3 rounded-xl
                  bg-white/5 hover:bg-white/10 border border-white/5
                  text-white text-sm font-semibold
                  transition-all flex items-center justify-center gap-2
                "
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">Loading...</p>
          </div>
        ) : data ? (
          <div className="mt-8 sm:mt-10 space-y-8">
            {/* STATS */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-5 opacity-0 animate-fade-in-up stagger-1"
              style={{ animationFillMode: "forwards" }}
            >
              {[
                { label: "SESSIONS", val: data.stats.sessionsCompleted, icon: Activity, iconColor: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/15" },
                { label: "PROGRAMS", val: data.stats.totalPrograms, icon: TrendingUp, iconColor: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/15" },
                { label: "HOURS", val: data.stats.totalHours?.toFixed(1), icon: Clock, iconColor: "text-cyan-300", bg: "bg-cyan-300/10", border: "border-cyan-300/15" },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="
                      bg-[#111118] border border-[#27273a]
                      rounded-2xl p-6
                      shadow-[0_18px_60px_rgba(0,0,0,0.30)]
                      hover:border-white/15 transition-all
                    "
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${s.iconColor}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                          {s.label}
                        </p>
                        <p className="text-4xl font-bold text-white">
                          {s.val ?? 0}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Overview
                    </p>
                  </div>
                );
              })}
            </div>

            {/* DETAILS */}
            <div
              className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.40)]
                        opacity-0 animate-fade-in-up stagger-2"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
                <h2 className="text-lg sm:text-xl font-bold text-white">PERSONAL INFORMATION</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: User, label: "First name", value: data.firstName },
                  { icon: User, label: "Last name", value: data.lastName },
                  { icon: Mail, label: "Email", value: data.email, isEmail: true },
                  { icon: Activity, label: "Gender", value: data.gender },
                  { icon: Calendar, label: "Age", value: data.age ? `${data.age} years` : null },
                  { icon: MapPin, label: "Address", value: data.address },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="
                        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2
                        p-4 rounded-xl bg-[#0a0a0f] border border-[#27273a]
                      "
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                          {item.label}
                        </span>
                      </div>

                      <span
                        className={`text-sm font-semibold text-white ${
                          item.isEmail ? "break-all sm:text-right" : "sm:text-right"
                        }`}
                      >
                        {item.value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 bg-[#111118] border border-[#27273a] rounded-2xl p-10 text-center">
            <p className="text-slate-400 font-semibold">Profile could not be loaded.</p>
          </div>
        )}
      </div>
    </div>
  );
}