import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

/** Spinner mínimo (SVG, sin dependencias) con el acento de marca. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin text-emerald-400", className)}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Cargando"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="4"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CenteredMessage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-10 text-center text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <CenteredMessage className="text-muted">
      <Spinner />
      <span>{label}</span>
    </CenteredMessage>
  );
}

export function EmptyState({
  title = "Sin datos",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <CenteredMessage className="text-muted">
      <p className="font-medium text-foreground/80">{title}</p>
      {description && <p className="text-muted">{description}</p>}
    </CenteredMessage>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <CenteredMessage className="text-red-300">
      <p className="font-medium">No se pudo cargar</p>
      {message && <p className="text-red-300/60">{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          Reintentar
        </Button>
      )}
    </CenteredMessage>
  );
}
