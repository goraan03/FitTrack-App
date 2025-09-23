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
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white text-black w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">Program details</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto overscroll-contain">
          <div>
            <div className="text-sm text-gray-600">Title</div>
            <div className="font-semibold text-gray-900">{data.title}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Level</div>
              <div className="font-medium text-gray-900 capitalize">{data.level}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-sm text-gray-600">Trainer</div>
              <div className="font-medium text-gray-900">{data.trainerName}</div>
            </div>
          </div>

          {data.description && (
            <div>
              <div className="text-sm text-gray-600">Description</div>
              <div className="text-sm text-gray-800">{data.description}</div>
            </div>
          )}

          <div>
            <div className="text-sm text-gray-600 mb-2">Exercises</div>
            {data.exercises?.length ? (
              <ul className="space-y-4">
                {data.exercises.map((ex) => {
                  const embed = toYouTubeEmbed(ex.videoUrl);
                  return (
                    <li
                      key={`${ex.exerciseId}-${ex.position}`}
                      className="border border-gray-200 rounded-xl p-3"
                    >
                      <div className="font-medium text-gray-900">{ex.name}</div>
                      {ex.description && (
                        <div className="text-sm text-gray-700 mt-1">{ex.description}</div>
                      )}

                      {ex.videoUrl && (
                        <div className="mt-3">
                          {embed ? (
                            <div className="w-full aspect-video">
                              <iframe
                                className="w-full h-full rounded-lg border border-gray-200"
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
                              className="inline-flex text-sm text-yellow-600 hover:text-yellow-700 underline"
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
              <div className="text-sm text-gray-500">No exercises provided.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}