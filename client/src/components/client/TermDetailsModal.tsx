import { format } from "date-fns";

type TermDetails = {
  id: number;
  title: string;
  startAt: string;        // ISO
  endAt: string;          // ISO
  type: 'individual' | 'group';
  trainerName?: string;
  programTitle?: string;
  exercises?: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  data?: TermDetails;
};

export default function TermDetailsModal({ open, onClose, data }: Props) {
  if (!open || !data) return null;

  const start = new Date(data.startAt);
  const end = new Date(data.endAt);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Session details</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="text-sm text-gray-600">Title</div>
            <div className="font-semibold text-gray-900">{data.title}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="font-medium">{format(start, "EEE, MMM d")}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Time</div>
              <div className="font-medium">
                {format(start, "HH:mm")}–{format(end, "HH:mm")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Type</div>
              <div className="font-medium capitalize">{data.type}</div>
            </div>
            {data.trainerName && (
              <div>
                <div className="text-sm text-gray-600">Trainer</div>
                <div className="font-medium">{data.trainerName}</div>
              </div>
            )}
            {data.programTitle && (
              <div className="sm:col-span-2">
                <div className="text-sm text-gray-600">Program</div>
                <div className="font-medium">{data.programTitle}</div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Exercises</div>
            {data.exercises && data.exercises.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                {data.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
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