import { useEffect, useState } from "react";
import { Users, Search, Send, Clock } from "lucide-react";
import toast from "react-hot-toast";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";

interface Props {
  clientApi: IClientAPIService;
  onTrainerChosen: () => void;
}

interface TrainerOption {
  id: number;
  name: string;
  email: string;
}

export default function ChooseTrainerPage({ clientApi }: Props) {
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await clientApi.listTrainers();
        if (res.success) setTrainers(res.data ?? []);
      } catch {
        toast.error("Error while loading trainers");
      } finally {
        setLoading(false);
      }
    })();
  }, [clientApi]);

  const sendRequest = async (trainerId: number) => {
    setActionId(trainerId);
    try {
      const res = await clientApi.sendTrainerRequest(trainerId);
      if (res.success) {
        toast.success("Request sent to trainer!");
        setSentIds(prev => new Set([...prev, trainerId]));
      } else {
        const msg = res.message || "Error";
        if (msg === "REQUEST_ALREADY_PENDING") toast("Request has been already sent to this trainer", { icon: "ℹ️" });
        else if (msg === "ALREADY_ASSIGNED") toast("You are already assigned to this trainer", { icon: "ℹ️" });
        else toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Error");
    } finally {
      setActionId(null);
    }
  };

  const filtered = trainers.filter(t =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="pb-12">
        <div className="flex flex-col gap-4 mb-10 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            CHOOSE <span className="text-amber-400">TRAINER</span>
          </h1>
          <p className="text-slate-400 text-sm tracking-wide uppercase">
            Send a request to trainer and he will accept it
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full max-w-md bg-[#111118] border border-[#27273a] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors"
            placeholder="Search trainers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">Učitavanje...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-16 text-center">
            <Users className="w-14 h-14 mx-auto mb-5 text-slate-600" />
            <p className="text-slate-400 font-bold uppercase tracking-wider">There are no available trainers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-0 animate-fade-in-up stagger-2" style={{ animationFillMode: "forwards" }}>
            {filtered.map(trainer => {
              const sent = sentIds.has(trainer.id);
              return (
                <div
                  key={trainer.id}
                  className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 flex flex-col gap-5 hover:border-white/10 transition-all card-hover"
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                      {trainer.name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{trainer.name}</p>
                      <p className="text-slate-500 text-xs truncate">{trainer.email}</p>
                    </div>
                  </div>

                  <button
                    disabled={sent || actionId === trainer.id}
                    onClick={() => sendRequest(trainer.id)}
                    className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      sent
                        ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 cursor-default"
                        : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f] btn-glow disabled:opacity-50"
                    }`}
                  >
                    {sent ? (
                      <><Clock className="w-4 h-4" />Request sent</>
                    ) : actionId === trainer.id ? (
                      <div className="w-4 h-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin" />
                    ) : (
                      <><Send className="w-4 h-4" />Send requestv</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
