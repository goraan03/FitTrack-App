import { useEffect, useMemo, useState } from "react";
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
import { StatCard } from "../../components/client/StatCard";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { TrainerProfile } from "../../types/trainer/TrainerProfile";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler, Title);

interface TrainerProfilePageProps {
  trainerApi: ITrainerAPIService;
}

export default function TrainerProfilePage({ trainerApi }: TrainerProfilePageProps) {
  const [data, setData] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await trainerApi.getMyProfile();
        if (!mounted) return;
        if (res.success) {
          setData(res.data);
        } else {
          setErr(res.message || "Failed to load profile");
        }
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Error loading the profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [trainerApi]);

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
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          borderColor: "#10B981",
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 to-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Avatar name={fullName} src={data?.avatarUrl ?? null} />
            <div className="text-white">
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-emerald-100">Public information and progress</p>
              {data?.isBlocked && (
                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-600/20 px-3 py-1 text-sm text-white ring-1 ring-red-400/50">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Account is blocked - functionality is limited
                </span>
              )}
            </div>
            <div className="ml-auto text-right text-white">
              <div className="text-lg font-semibold">{fullName || "—"}</div>
              <div className="text-emerald-100 text-sm">{data?.email || ""}</div>
            </div>
          </div>
        </div>

        {/* LOADING / ERROR */}
        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="col-span-2 rounded-xl ring-1 ring-gray-200 bg-white p-6 shadow-sm animate-pulse h-72" />
            <div className="rounded-xl ring-1 ring-gray-200 bg-white p-6 shadow-sm animate-pulse h-72" />
            <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl ring-1 ring-gray-200 bg-white shadow-sm animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {err && !loading && (
          <div className="mt-6 rounded-lg ring-1 ring-red-200 bg-red-50 px-4 py-3 text-red-800">{err}</div>
        )}

        {!loading && !err && data && (
          <>
            {/* STAT KARTICE */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Completed Sessions" value={data.stats.sessionsCompleted ?? 0} />
              <StatCard
                label="Average Rating"
                value={data.stats.avgRating != null ? data.stats.avgRating.toFixed(1) : "—"}
                sub="1–10"
              />
              <StatCard label="Programs" value={data.stats.totalPrograms ?? 0} />
              <StatCard label="Total Hours" value={(data.stats.totalHours ?? 0).toFixed(1)} />
            </div>

            {/* GLAVNA MREŽA */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Profil info */}
              <div className="rounded-2xl ring-1 ring-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{data.firstName || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Surname</span>
                    <span className="font-medium text-gray-900">{data.lastName || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{data.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium text-gray-900">{data.gender ?? "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Age</span>
                    <span className="font-medium text-gray-900">{data.age ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address</span>
                    <span className="max-w-[60%] text-right font-medium text-gray-900">{data.address ?? "—"}</span>
                  </div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className="lg:col-span-2 rounded-2xl ring-1 ring-gray-200 bg-white p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                  <span className="text-xs text-gray-500">Average rating over time</span>
                </div>
                <div className="mt-4 flex-grow relative">
                  {data.ratingsTrend?.length ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No data available yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}