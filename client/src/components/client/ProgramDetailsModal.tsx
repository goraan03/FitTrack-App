import type { ProgramDetails } from "../../types/programs/ProgramDetails";
import { useLockBodyScroll } from "../../hooks/other/useLockBodyScroll";

type Props = {
  open: boolean;
  onClose: () => void;
  data?: ProgramDetails | null;
};

function toYouTubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProgramDetailsModal({ open, onClose, data }: Props) {
  useLockBodyScroll(open);
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[2rem] border border-[#27273a] bg-[#111118] shadow-[0_30px_90px_rgba(0,0,0,0.90)] flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111118] z-10">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Program details
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white truncate">
              {data.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-xl
              bg-white/5 hover:bg-white/10
              text-white text-xs font-black uppercase tracking-widest
              border border-white/5 transition
            "
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto overscroll-contain">
          
          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Level
              </div>
              <div className="mt-1 font-black uppercase text-white">
                {data.level}
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 sm:col-span-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Trainer
              </div>
              <div className="mt-1 font-bold text-white">
                {data.trainerName}
              </div>
            </div>
          </div>

          {data.description && (
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Description
              </div>
              <div className="mt-2 text-sm text-slate-300 leading-relaxed">
                {data.description}
              </div>
            </div>
          )}

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-amber-400 rounded-full" />
              <h4 className="text-sm font-black uppercase tracking-widest text-white">
                Exercises
              </h4>
            </div>

            {data.exercises?.length ? (
              <ul className="space-y-4">
                {data.exercises.map((ex) => {
                  const embed = toYouTubeEmbed(ex.videoUrl);

                  return (
                    <li
                      key={`${ex.exerciseId}-${ex.position}`}
                      className="bg-black/30 border border-white/5 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-black uppercase tracking-tight text-white">
                            {ex.position}. {ex.name}
                          </div>

                          {ex.description && (
                            <div className="text-sm text-slate-400 mt-2 leading-relaxed">
                              {ex.description}
                            </div>
                          )}
                        </div>

                        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-200 border border-white/10">
                          #{ex.position}
                        </span>
                      </div>

                      {ex.videoUrl && (
                        <div className="mt-4">
                          {embed ? (
                            <div className="w-full aspect-video overflow-hidden rounded-2xl border border-white/5 bg-black">
                              <iframe
                                className="w-full h-full"
                                src={embed}
                                title={ex.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <a
                              href={ex.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex text-xs font-black uppercase tracking-widest text-amber-300 hover:text-amber-200 underline"
                            >
                              Open video
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="bg-black/30 border border-white/5 rounded-2xl p-6 text-slate-400">
                No exercises provided.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}