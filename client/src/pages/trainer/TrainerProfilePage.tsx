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
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 font-sans pb-20">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 space-y-6 md:space-y-8">
        
        {/* HEADER / HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-[#161616] border border-white/5 shadow-2xl p-6 md:p-10">
          <div className="relative z-10 flex flex-col items-center md:flex-row gap-6 md:gap-10">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-10 rounded-full" />
              <div className="relative ring-2 ring-yellow-400/30 rounded-full p-1">
                <Avatar name={fullName} src={data?.avatarUrl ?? null} />
              </div>
            </div>

            <div className="text-center md:text-left space-y-3 flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white truncate">
                {fullName}
              </h1>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <p className="flex items-center gap-2 text-yellow-400 font-black text-[10px] uppercase tracking-widest">
                  <Award className="w-3 h-3" /> Certified Trainer
                </p>
                <span className="hidden md:block w-1 h-1 bg-gray-700 rounded-full" />
                <p className="text-gray-400 text-xs md:text-sm font-medium break-all md:break-normal px-4 md:px-0">
                  {data?.email}
                </p>
              </div>
            </div>

            <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div></div>
        ) : data && (
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            
            {/* STATS - Uklonjeno belo, dodat dark stil */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Sessions", val: data.stats.sessionsCompleted, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Programs", val: data.stats.totalPrograms, icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                { label: "Hours", val: data.stats.totalHours?.toFixed(1), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" }
              ].map((s, idx) => (
                <div key={idx} className="bg-[#161616] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                  <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-none mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-white">{s.val ?? 0}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DETAILS GRID */}
            <div className="bg-[#161616] rounded-3xl border border-white/5 p-6 md:p-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-2 h-6 bg-yellow-400 rounded-full" />
                <h2 className="text-lg md:text-xl font-black uppercase">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: User, label: "First Name", value: data.firstName },
                  { icon: User, label: "Last Name", value: data.lastName },
                  { icon: Mail, label: "Email Address", value: data.email, isEmail: true },
                  { icon: Activity, label: "Gender", value: data.gender },
                  { icon: Calendar, label: "Age", value: data.age ? `${data.age} y` : null },
                  { icon: MapPin, label: "Address", value: data.address }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 gap-2">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold text-gray-100 ${item.isEmail ? 'break-all text-right' : 'text-left sm:text-right'}`}>
                      {item.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}