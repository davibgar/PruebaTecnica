import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Spinner mínimo (SVG, sin dependencias). */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin text-slate-400", className)}
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
        strokeOpacity="0.25"
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
    <CenteredMessage className="text-slate-500">
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
    <CenteredMessage className="text-slate-500">
      <p className="font-medium text-slate-600">{title}</p>
      {description && <p className="text-slate-400">{description}</p>}
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
    <CenteredMessage className="text-red-600">
      <p className="font-medium">No se pudo cargar</p>
      {message && <p className="text-red-400">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 text-xs font-medium text-slate-600 underline hover:text-slate-900"
        >
          Reintentar
        </button>
      )}
    </CenteredMessage>
  );
}
