import { Link } from "react-router-dom";

type Props = {
  showText?: boolean;
  text?: string;
  to?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function Brand({
  showText = true,
  text,
  to = "/",
  size = "md",
  className = "",
}: Props) {
  const sizes = {
    sm: { img: "/images/fittrack-brand-32.png", box: "h-8 w-8", text: "text-lg" },
    md: { img: "/images/fittrack-brand-36.png", box: "h-9 w-9", text: "text-xl" },
    lg: { img: "/images/fittrack-brand-48.png", box: "h-12 w-12", text: "text-2xl" },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={sizes.img}
        alt="FitTrack"
        className={`${sizes.box} rounded-xl`}
        draggable={false}
      />
      {showText && (
        <span className={`${sizes.text} font-extrabold tracking-wider uppercase text-amber-400`}>
          {text || "FitTrack"}
        </span>
      )}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}