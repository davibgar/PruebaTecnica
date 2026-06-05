import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "brand" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 disabled:opacity-40",
  brand:
    "bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30 hover:bg-emerald-400/25 disabled:opacity-40",
  secondary:
    "border border-border-strong bg-white/[0.03] text-foreground hover:bg-white/[0.07] disabled:opacity-40",
  ghost: "text-muted hover:bg-white/5 hover:text-foreground disabled:opacity-40",
  danger:
    "text-red-300/90 ring-1 ring-inset ring-red-400/20 hover:bg-red-400/10 disabled:opacity-40",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
