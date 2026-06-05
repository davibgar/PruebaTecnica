"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { downloadReport } from "@/lib/api/dashboard";
import { useFilters } from "../filters/filters-context";

/** Exporta el reporte por campaña (CSV/PDF) respetando los filtros activos. */
export function ExportButtons() {
  const { filter } = useFilters();
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (format: "csv" | "pdf") => {
    setBusy(format);
    setError(null);
    try {
      await downloadReport(filter, format);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo generar el archivo",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <Button
        variant="secondary"
        disabled={busy !== null}
        onClick={() => handle("csv")}
      >
        {busy === "csv" ? "Exportando…" : "CSV"}
      </Button>
      <Button
        variant="secondary"
        disabled={busy !== null}
        onClick={() => handle("pdf")}
      >
        {busy === "pdf" ? "Exportando…" : "PDF"}
      </Button>
    </div>
  );
}
