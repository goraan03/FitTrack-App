import { useMemo } from "react";

export function Avatar({ name, src }: { name: string; src?: string | null }) {
  const initials = useMemo(() => {
    const parts = name.trim().split(" ");
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }, [name]);

  if (src) {
    return <img src={src} alt={name} className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow" />;
  }
  return (
    <div className="h-20 w-20 rounded-full bg-emerald-600 text-white ring-4 ring-white shadow flex items-center justify-center text-2xl font-semibold">
      {initials || "?"}
    </div>
  );
}