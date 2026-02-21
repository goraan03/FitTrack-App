import { useNavigate } from "react-router-dom";
import { format, differenceInMinutes } from "date-fns";
import type { TermDetails } from "../../models/client/TermDetails";
import { useLockBodyScroll } from "../../hooks/other/useLockBodyScroll";

type Props = { 
  open: boolean; 
  onClose: () => void; 
  data?: TermDetails; 
  isTrainer?: boolean; 
  onDelete?: (id: number) => void; 
};

export default function TermDetailsModal({ open, onClose, data, isTrainer, onDelete }: Props) {
  useLockBodyScroll(open);
  const navigate = useNavigate();

  if (!open || !data) return null;

  const start = new Date(data.startAt);
  const end = new Date(data.endAt);

  const handleStartWorkout = () => {
    const now = new Date();
    const diff = differenceInMinutes(start, now);

    // Ako je trening više od 15 min u budućnosti, traži potvrdu
    if (diff > 15) {
      const confirm = window.confirm(`Termin počinje tek za ${diff} minuta. Da li ste sigurni da želite da počnete ranije?`);
      if (!confirm) return;
    }
    
    onClose();
    // OVA RUTA MORA POSTOJATI U App.tsx (vidi korak 2)
    navigate(`/trainer/live-workout/${data.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white text-black w-full max-w-lg max-h-[90vh] rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header - Ostaje isti */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">Detalji sesije</h3>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
            Zatvori
          </button>
        </div>

        {/* Content - VRAĆAMO SVE TVOJE INFORMACIJE */}
        <div className="p-5 space-y-4 overflow-y-auto overscroll-contain">
          <div>
            <div className="text-sm text-gray-600">Naziv programa</div>
            <div className="font-semibold text-gray-900">{data.title}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Datum</div>
              <div className="font-medium text-gray-900">{format(start, "EEE, MMM d")}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Vrijeme</div>
              <div className="font-medium text-gray-900">{format(start, "HH:mm")}–{format(end, "HH:mm")}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Tip</div>
              <div className="font-medium text-gray-900 capitalize">{data.type}</div>
            </div>
            {data.trainerName && (
              <div>
                <div className="text-sm text-gray-600">Trener</div>
                <div className="font-medium text-gray-900">{data.trainerName}</div>
              </div>
            )}
          </div>

          {/* DODATNA DUGMAD ZA TRENERA */}
          {isTrainer && (
            <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col gap-3">
              <button
                onClick={handleStartWorkout}
                disabled={data.completed}
                className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg ${
                  data.completed
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                }`}
              >
                {data.completed ? 'Trening je završen' : '🚀 Započni trening'}
              </button>
              
              <button
                onClick={() => {
                  if(window.confirm("PAŽNJA: Ovo će trajno obrisati termin i sve prijave klijenta. Nastaviti?")) {
                    onDelete?.(data.id);
                  }
                }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold transition-all text-sm"
              >
                Obriši termin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
