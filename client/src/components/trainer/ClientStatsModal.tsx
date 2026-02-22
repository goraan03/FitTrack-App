import { useEffect, useState } from "react";
import { X, TrendingUp, Dumbbell, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from "react-hot-toast";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface Props {
  open: boolean;
  clientId: number | null;
  onClose: () => void;
  trainerApi: ITrainerAPIService;
}

export default function ClientStatsModal({ open, clientId, onClose, trainerApi }: Props) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // lock background scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    if (open && clientId) {
      loadStats();
    }
  }, [open, clientId]);

  const loadStats = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await trainerApi.getClientStats(clientId);
      if (res.success) {
        setStats(res.data);
      } else {
        toast.error("Failed to load stats");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error loading stats");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 pt-28 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#161616] rounded-2xl border border-white/10 w-full max-w-4xl sm:max-w-5xl lg:max-w-5xl max-h-[82vh] overflow-y-auto shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#1a1a1a] to-[#161616] border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black uppercase">CLIENT PROGRESS</h2>
            {stats && (
              <p className="text-gray-400 text-sm mt-1">
                {stats.client.firstName} {stats.client.lastName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading stats...</p>
          </div>
        ) : stats ? (
          <div className="p-6 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-400/20 rounded-lg">
                    <Dumbbell className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Total Workouts</span>
                </div>
                <p className="text-3xl font-black">{stats.summary.totalWorkouts}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-400/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Total Volume</span>
                </div>
                <p className="text-3xl font-black">{stats.summary.totalVolume.toFixed(0)} kg</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-400/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Exercises</span>
                </div>
                <p className="text-3xl font-black">{stats.summary.exercisesTracked}</p>
              </div>
            </div>

            {/* Exercise Progress */}
            {stats.exercises.map((ex: any) => (
              <div key={ex.exerciseId} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-black uppercase mb-2">{ex.exerciseName}</h3>
                  <div className="flex gap-6 text-sm">
                    <span className="text-gray-400">
                      Sessions: <span className="text-white font-bold">{ex.totalSessions}</span>
                    </span>
                    <span className="text-gray-400">
                      Max Weight: <span className="text-yellow-400 font-bold">{ex.maxWeight} kg</span>
                    </span>
                    <span className="text-gray-400">
                      Total Volume: <span className="text-blue-400 font-bold">{ex.totalVolume.toFixed(0)} kg</span>
                    </span>
                  </div>
                </div>

                {/* Chart */}
                {ex.progressData.length > 0 && (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={ex.progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1a1a1a', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="maxWeight" 
                        stroke="#EAB308" 
                        strokeWidth={2}
                        name="Max Weight (kg)"
                        dot={{ fill: '#EAB308' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalVolume" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Total Volume (kg)"
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center opacity-30">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">No stats available</p>
          </div>
        )}
      </div>
    </div>
  );
}
