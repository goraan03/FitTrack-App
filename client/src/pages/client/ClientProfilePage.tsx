import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  Title,
} from "chart.js";
import { Avatar } from "../../components/client/Avatar";
import EditProfileModal from "../../components/profile/EditProfileModal";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";
import type { ClientProfile } from "../../types/users/ClientProfile";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler, Title);

interface ClientProfilePageProps {
  clientApi: IClientAPIService;
}

export default function ClientProfilePage({ clientApi }: ClientProfilePageProps) {
  const navigate = useNavigate();

  const [data, setData] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await clientApi.getMyProfile();
        if (!mounted) return;
        if (res.success) setData(res.data);
        else setErr(res.message || "Failed to load profile");
      } catch (e: unknown) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : "Error loading the profile";
        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [clientApi]);

  const fullName = useMemo(() => {
    if (!data) return "";
    const fn = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
    return fn || data.email || "";
  }, [data]);

  const chartData = useMemo(() => {
    const points = data?.ratingsTrend ?? [];
    return {
      labels: points.map((p) => new Date(p.date).toLocaleDateString()),
      datasets: [
        {
          label: "Average score",
          data: points.map((p) => p.avg ?? 0),
          fill: true,
          backgroundColor: "rgba(250, 204, 21, 0.20)",
          borderColor: "#EAB308",
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, suggestedMin: 0, suggestedMax: 10, ticks: { stepSize: 1 } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false, mode: "index" as const },
      },
    }),
    []
  );

return (
  <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
    <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-white/5 via-white/0 to-transparent pointer-events-none" />

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
                {fullName || "My Profile"}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="inline-flex items-center justify-center sm:justify-start gap-2 text-amber-300 text-[11px] font-semibold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Client
                </p>

                <span className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full" />

                <p className="text-slate-400 text-sm font-medium break-all sm:break-normal">
                  {data?.email || ""}
                </p>
              </div>

              {data?.isBlocked && (
                <div className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-full bg-rose-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400 border border-rose-500/20">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Account is blocked — functionality is limited
                </div>
              )}
            </div>

            {/* Edit */}
            <div className="w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditErr(null);
                  setEditOpen(true);
                }}
                className="
                  w-full sm:w-auto px-6 py-3 rounded-xl
                  bg-white/5 hover:bg-white/10 border border-white/5
                  text-white text-sm font-semibold
                  transition-all flex items-center justify-center gap-2
                "
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">Loading...</p>
        </div>
      ) : err ? (
        <div className="mt-10 bg-[#111118] border border-rose-500/25 rounded-2xl p-6 text-center shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <p className="text-rose-300 font-semibold">{err}</p>
        </div>
      ) : data ? (
        <div className="mt-8 sm:mt-10 space-y-8">
          {/* STATS */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 opacity-0 animate-fade-in-up stagger-1"
            style={{ animationFillMode: "forwards" }}
          >
            {[
              {
                label: "SESSIONS",
                val: data.stats.sessionsCompleted ?? 0,
                toneBg: "bg-emerald-400/10",
                toneBorder: "border-emerald-400/15",
                toneText: "text-emerald-300",
              },
              {
                label: "AVG RATING",
                val: data.stats.avgRating != null ? data.stats.avgRating.toFixed(1) : "—",
                toneBg: "bg-amber-400/10",
                toneBorder: "border-amber-400/15",
                toneText: "text-amber-400",
              },
              {
                label: "HOURS",
                val: (data.stats.totalHours ?? 0).toFixed(1),
                toneBg: "bg-cyan-300/10",
                toneBorder: "border-cyan-300/15",
                toneText: "text-cyan-300",
              },
            ].map((s, idx) => {
              const displayVal = s.val ?? "—";
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
                  <div className={`w-12 h-12 rounded-xl ${s.toneBg} border ${s.toneBorder} flex items-center justify-center`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${s.toneText} bg-current`} />
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">{s.label}</p>
                    <p className="text-4xl font-bold text-white tabular-nums">{displayVal}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 uppercase tracking-wide">Overview</p>
              </div>
            );
            })}
          </div>

          {/* DETAILS + CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DETAILS */}
            <div
              className="
                bg-[#111118] border border-[#27273a] rounded-2xl p-6 sm:p-8
                shadow-[0_18px_60px_rgba(0,0,0,0.40)]
                opacity-0 animate-fade-in-up stagger-2
              "
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
                <h2 className="text-lg sm:text-xl font-bold text-white">PERSONAL INFORMATION</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: "First name", value: data.firstName },
                  { label: "Last name", value: data.lastName },
                  { label: "Email", value: data.email, isEmail: true },
                  { label: "Gender", value: data.gender },
                  { label: "Age", value: data.age != null ? `${data.age}` : null },
                  { label: "Address", value: data.address },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="
                      flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2
                      p-4 rounded-xl bg-[#0a0a0f] border border-[#27273a]
                    "
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {item.label}
                    </span>
                    <span
                      className={`text-sm font-semibold text-white ${item.isEmail ? "break-all sm:text-right" : "sm:text-right"}`}
                    >
                      {item.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART */}
            <div
              className="
                lg:col-span-2 bg-[#111118] border border-[#27273a] rounded-2xl p-6 sm:p-8
                shadow-[0_18px_60px_rgba(0,0,0,0.40)]
                opacity-0 animate-fade-in-up stagger-3
                flex flex-col
              "
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-300 to-cyan-400 rounded-full" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">PROGRESS</h2>
                </div>

                <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                  Average rating over time
                </span>
              </div>

              <div className="mt-5 flex-grow min-h-[280px] relative rounded-2xl border border-[#27273a] bg-[#0a0a0f] p-4">
                {data.ratingsTrend?.length ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 font-semibold">
                    No data available yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10 bg-[#111118] border border-[#27273a] rounded-2xl p-10 text-center">
          <p className="text-slate-400 font-semibold">Profile could not be loaded.</p>
        </div>
      )}
    </div>

    {/* EDIT MODAL */}
    {data ? (
      <EditProfileModal
        open={editOpen}
        title="Edit client profile"
        loading={editLoading}
        error={editErr}
        initial={{
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender === "musko" || data.gender === "zensko" ? data.gender : null,
          address: data.address || "",
          birthDateISO: data.dateOfBirthISO || "",
        }}
        onClose={() => setEditOpen(false)}
        onChangePassword={() => {
          setEditOpen(false);
          navigate("/app/change-password");
        }}
        onSave={async (v) => {
          setEditErr(null);
          setEditLoading(true);
          try {
            const res = await clientApi.updateMyProfile({
              firstName: v.firstName,
              lastName: v.lastName,
              gender: v.gender === "musko" || v.gender === "zensko" ? v.gender : null,
              address: v.address?.trim() ? v.address.trim() : null,
              dateOfBirthISO: v.birthDateISO?.trim() ? v.birthDateISO.trim() : null,
            });

            if (!res.success) {
              setEditErr(res.message || "Failed to save.");
              return;
            }

            const refreshed = await clientApi.getMyProfile();
            if (refreshed.success) setData(refreshed.data);

            setEditOpen(false);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to save changes.";
            setEditErr(msg);
          } finally {
            setEditLoading(false);
          }
        }}
      />
    ) : null}
  </div>
);
}
