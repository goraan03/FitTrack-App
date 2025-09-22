import { toast as hotToast } from "react-hot-toast";

export const toast = {
  success: (msg: string) => hotToast.success(msg),
  error: (msg: string) => hotToast.error(msg),
  info: (msg: string) => hotToast(msg),
  loading: (msg: string) => hotToast.loading(msg),
};

// Interaktivni "confirm" toast sa dugmadima
export function confirmToast(
  message: string,
  opts?: { okText?: string; cancelText?: string; duration?: number }
): Promise<boolean> {
  const { okText = "Confirm", cancelText = "Cancel", duration = 8000 } = opts || {};
  return new Promise((resolve) => {
    const id = hotToast.custom(
      (t) => (
        <div className="max-w-sm w-full rounded-xl bg-white text-black shadow-xl border border-gray-200 p-4 flex items-start gap-3">
          <div className="shrink-0 h-9 w-9 rounded-full bg-yellow-100 text-yellow-700 grid place-items-center border border-yellow-200">
            !
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">Are you sure?</div>
            <div className="text-sm text-gray-700 mt-0.5">{message}</div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => { hotToast.dismiss(id); resolve(true); }}
                className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-400/90 text-black font-semibold"
              >
                {okText}
              </button>
              <button
                onClick={() => { hotToast.dismiss(id); resolve(false); }}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-800"
              >
                {cancelText}
              </button>
            </div>
          </div>
          <button
            onClick={() => { hotToast.dismiss(id); resolve(false); }}
            className="ml-auto text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ),
      { duration }
    );
  });
}