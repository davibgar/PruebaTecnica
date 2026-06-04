import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApiError } from "@/lib/api/client";
import { EmptyState, ErrorState, LoadingState } from "./states";

/**
 * Renderiza el estado correcto de una query (loading / error / vacío / datos)
 * en un solo lugar, para que cada feature no repita el patrón.
 */
export function QueryBoundary<T>({
  query,
  children,
  loadingLabel,
  isEmpty,
  emptyTitle,
  emptyDescription,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  loadingLabel?: string;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (query.isPending) {
    return <LoadingState label={loadingLabel} />;
  }
  if (query.isError) {
    const message =
      query.error instanceof ApiError
        ? query.error.message
        : "Error de red. ¿Está corriendo el backend?";
    return <ErrorState message={message} onRetry={() => query.refetch()} />;
  }
  if (isEmpty?.(query.data)) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return <>{children(query.data)}</>;
}
