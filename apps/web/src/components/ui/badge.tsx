import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "green" | "red" | "amber" | "blue" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
};

/** Etiqueta de estado/categoría con tono semántico. */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
