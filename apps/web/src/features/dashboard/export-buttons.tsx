"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/components/ui/emoji";
import { ApiError } from "@/lib/api/client";
import { downloadReport } from "@/lib/api/dashboard";
import { useFilters } from "../filters/filters-context";

/** Exporta el reporte por campaña (CSV/PDF) respetando los filtros activos. */
export function ExportButtons() {
  const { filter } = useFilters();
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);

  const handle = (format: "csv" | "pdf") => {
    setBusy(format);
    const promise = downloadReport(filter, format);
    toast.promise(promise, {
      loading: `Generando ${format.toUpperCase()}…`,
      success: `Reporte ${format.toUpperCase()} descargado`,
      error: (e) =>
        e instanceof ApiError ? e.message : "No se pudo generar el archivo",
    });
    promise.finally(() => setBusy(null));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        disabled={busy !== null}
        onClick={() => handle("csv")}
      >
        <Emoji name="page" size={14} />
        {busy === "csv" ? "Exportando…" : "CSV"}
      </Button>
      <Button
        variant="secondary"
        disabled={busy !== null}
        onClick={() => handle("pdf")}
      >
        <Emoji name="inbox" size={14} />
        {busy === "pdf" ? "Exportando…" : "PDF"}
      </Button>
    </div>
  );
}
