import { Icon, type IconName } from "./icon";

/** Spinner mínimo con el acento de marca. */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Cargando"
      style={{ color: "var(--accent)" }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="empty">
      <div style={{ display: "grid", placeItems: "center", marginBottom: 10 }}>
        <Spinner />
      </div>
      <div className="empty-sub">{label}</div>
    </div>
  );
}

export function EmptyState({
  title = "Sin datos",
  description,
  icon = "inbox",
}: {
  title?: string;
  description?: string;
  icon?: IconName;
}) {
  return (
    <div className="empty">
      <div className="empty-ico">
        <Icon name={icon} size={40} />
      </div>
      <div className="empty-title">{title}</div>
      {description && <div className="empty-sub">{description}</div>}
    </div>
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
    <div className="empty">
      <div className="empty-ico" style={{ color: "var(--danger)" }}>
        <Icon name="alert" size={40} />
      </div>
      <div className="empty-title">No se pudo cargar</div>
      {message && <div className="empty-sub">{message}</div>}
      {onRetry && (
        <button
          className="btn btn-ghost"
          style={{ marginTop: 14 }}
          onClick={onRetry}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
