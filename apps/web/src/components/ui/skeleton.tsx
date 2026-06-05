import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Bloque base con shimmer para placeholders de carga. */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/[0.06]", className)}
      style={style}
    />
  );
}

/** Placeholder de la fila de 6 métricas. */
export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-surface/70 px-4 py-3"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder de un gráfico (barras de altura variable). */
export function ChartSkeleton() {
  const heights = ["60%", "85%", "45%", "70%"];
  return (
    <div className="flex h-[260px] items-end gap-4 px-2 pb-6 pt-2">
      {heights.map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: h }} />
      ))}
    </div>
  );
}

/** Placeholder de tabla: cabecera + N filas. */
export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-5">
      <Skeleton className="h-4 w-full" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Placeholder de lista (action center, origen de audiencia). */
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
