import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Emoji, type EmojiName } from "./emoji";

/** Superficie base: tarjeta oscura con borde sutil y esquinas suaves. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface/70 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.8)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  eyebrow,
  icon,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: EmojiName;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon && <Emoji name={icon} size={16} />}
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
