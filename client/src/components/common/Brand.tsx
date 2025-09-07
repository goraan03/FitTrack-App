import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  showText?: boolean;
  text?: string;
  to?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function Brand({ showText = true, text, to = "/", size = "md", className = "" }: Props) {
  const sizes = {
    sm: { box: "h-8 w-8", icon: "h-4 w-4", text: "text-lg" },
    md: { box: "h-9 w-9", icon: "h-5 w-5", text: "text-xl" },
    lg: { box: "h-12 w-12", icon: "h-6 w-6", text: "text-2xl" },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`${sizes.box} rounded-xl bg-emerald-600 text-white grid place-items-center shadow`}>
        <ShieldCheck className={sizes.icon} />
      </div>
      {showText && (
        <span className={`${sizes.text} font-bold tracking-tight text-emerald-700`}>
          {text || "FitTrack"}
        </span>
      )}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}