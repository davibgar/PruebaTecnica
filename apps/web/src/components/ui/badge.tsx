import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "green" | "red" | "amber" | "blue" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/5 text-muted ring-1 ring-inset ring-white/10",
  green: "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20",
  red: "bg-red-400/10 text-red-300 ring-1 ring-inset ring-red-400/20",
  amber: "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/20",
  blue: "bg-blue-400/10 text-blue-300 ring-1 ring-inset ring-blue-400/20",
  violet: "bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/20",
};

/** Etiqueta de estado/categoría con tono semántico (sobre fondo oscuro). */
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
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
