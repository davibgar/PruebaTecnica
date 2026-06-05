"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api/client";
import { downloadReport } from "@/lib/api/dashboard";
import { useFilters } from "../filters/filters-context";

/** Exporta el reporte por campaña (CSV/PDF) respetando los filtros activos. */
export function ExportButtons() {
  const { report } = useFilters();
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);

  const handle = (format: "csv" | "pdf") => {
    setBusy(format);
    const p = downloadReport(report, format);
    toast.promise(p, {
      loading: `Generando ${format.toUpperCase()}…`,
      success: `Reporte ${format.toUpperCase()} descargado`,
      error: (e) =>
        e instanceof ApiError ? e.message : "No se pudo generar el archivo",
    });
    p.finally(() => setBusy(null));
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="chip-reset" disabled={busy !== null} onClick={() => handle("csv")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Icon name="book" size={13} /> {busy === "csv" ? "…" : "CSV"}
      </button>
      <button className="chip-reset" disabled={busy !== null} onClick={() => handle("pdf")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Icon name="inbox" size={13} /> {busy === "pdf" ? "…" : "PDF"}
      </button>
    </div>
  );
}
