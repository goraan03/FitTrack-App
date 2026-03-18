import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { PendingRequest } from "../../types/trainer/Billing";
import { useSettings } from "../../context/SettingsContext";

interface Props { trainerApi: ITrainerAPIService; }

export default function TrainerRequestsPage({ trainerApi }: Props) {
  const { t } = useSettings();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await trainerApi.listPendingRequests();
      if (res.success) setRequests(res.data);
    } catch {
      toast.error(t('error_loading_requests'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: number) => {
    setActionId(id);
    try {
      const res = await trainerApi.approveRequest(id);
      if (res.success) {
        toast.success(t('client_approved'));
        await load();
      } else {
        const msg = res.message || "Greška";
        if (msg.startsWith("PLAN_LIMIT_REACHED")) toast.error(t('plan_limit_reached'));
        else toast.error(msg);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t('error');
      if (msg.startsWith("PLAN_LIMIT_REACHED")) toast.error(t('plan_limit_reached'));
      else toast.error(msg);
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id: number) => {
    setActionId(id);
    try {
      const res = await trainerApi.rejectRequest(id);
      if (res.success) {
        toast.success(t('request_rejected'));
        await load();
      } else {
        toast.error(res.message || t('error'));
      }
    } catch {
      toast.error(t('error'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="pb-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 uppercase">
              {t('client_requests_title')}
            </h1>
            <p className="text-slate-400 text-sm tracking-wide uppercase">
              {t('approve_or_reject_requests')}
            </p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">{requests.length} {t('pending')}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">Učitavanje...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-16 text-center opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
            <UserCheck className="w-14 h-14 mx-auto mb-5 text-slate-600" />
            <p className="text-slate-300 font-bold text-lg mb-2 uppercase tracking-wider">{t('no_new_requests')}</p>
            <p className="text-slate-500 text-sm">{t('client_request_empty_desc')}</p>
          </div>
        ) : (
          <div className="space-y-4 opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-[#111118] border border-[#27273a] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:border-white/10 transition-all card-hover"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                  {req.clientName[0]?.toUpperCase() ?? "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base">{req.clientName}</p>
                  <p className="text-slate-400 text-sm">{req.clientEmail}</p>
                  <p className="text-slate-600 text-xs mt-1 uppercase tracking-wider">
                    {new Date(req.createdAt).toLocaleDateString('sr-RS')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    disabled={actionId === req.id}
                    onClick={() => reject(req.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/5 hover:bg-red-400/10 border border-red-400/15 text-red-400 font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('reject')}
                  </button>
                  <button
                    disabled={actionId === req.id}
                    onClick={() => approve(req.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f] font-bold text-sm uppercase tracking-wider transition-all btn-glow disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('approve')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}