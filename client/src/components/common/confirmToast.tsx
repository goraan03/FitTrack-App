import toast from "react-hot-toast";

type ConfirmToastOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "amber" | "red";
};

export function confirmToast({
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  tone = "amber",
}: ConfirmToastOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const close = (value: boolean) => {
      if (settled) return;
      settled = true;
      toast.dismiss(toastId);
      resolve(value);
    };

    const toneClasses =
      tone === "red"
        ? {
            iconBg: "bg-red-500/15",
            iconText: "text-red-300",
            border: "border-red-400/25",
            accent: "text-red-300",
            button: "from-red-500 to-rose-500 text-white",
          }
        : {
            iconBg: "bg-amber-400/15",
            iconText: "text-amber-300",
            border: "border-amber-400/25",
            accent: "text-amber-300",
            button: "from-amber-400 to-amber-500 text-[#0a0a0f]",
          };

    const toastId = toast.custom(
      (instance) => (
        <div
          className={`pointer-events-auto w-[min(92vw,420px)] rounded-2xl border bg-[#111118] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all ${toneClasses.border} ${
            instance.visible ? "animate-enter" : "animate-leave"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl text-lg ${toneClasses.iconBg} ${toneClasses.iconText}`}>
              {tone === "red" ? "!" : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">{title}</div>
              <p className="mt-1 text-sm leading-5 text-slate-300">
                <span className={toneClasses.accent}>{message}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => close(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => close(true)}
              className={`rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-semibold transition-transform active:scale-[0.98] ${toneClasses.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
}
