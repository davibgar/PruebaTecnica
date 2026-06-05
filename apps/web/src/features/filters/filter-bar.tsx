"use client";

import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "@/lib/api/dashboard";
import { MODEL_LABELS, ORIGIN_LABELS } from "@/lib/labels";
import { queryKeys } from "@/lib/query-keys";
import { AttributionModel, AudienceOrigin } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/components/ui/emoji";
import { Select, type SelectOption } from "@/components/ui/select";
import { useFilters } from "./filters-context";

const MODEL_OPTIONS: SelectOption[] = Object.values(AttributionModel).map(
  (value) => ({ value, label: MODEL_LABELS[value] }),
);

const ORIGIN_OPTIONS: SelectOption[] = Object.values(AudienceOrigin).map(
  (value) => ({ value, label: ORIGIN_LABELS[value] }),
);

/**
 * Filtros nativos que recalculan todo el dashboard: fechas, campaña, origen de
 * audiencia y modelo de atribución. Cambiar cualquiera muta el contexto y React
 * Query refetchea las vistas dependientes sin recargar la página.
 */
export function FilterBar() {
  const { filter, patch, reset } = useFilters();

  // Lista de campañas para el dropdown (sin filtrar: todas las del negocio).
  const campaignsQuery = useQuery({
    queryKey: queryKeys.campaigns({ model: filter.model }),
    queryFn: () => getCampaigns({ model: filter.model }),
  });

  const campaignOptions: SelectOption[] = (campaignsQuery.data ?? []).map(
    (c) => ({ value: c.campaignId, label: c.name }),
  );

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface/70 p-4 shadow-sm backdrop-blur-sm">
      <span className="mr-1 hidden items-center gap-1.5 self-center text-[11px] font-medium uppercase tracking-wide text-muted sm:flex">
        <Emoji name="knobs" size={14} />
        Filtros
      </span>
      <DateField
        label="Desde"
        value={filter.from}
        onChange={(from) => patch({ from })}
      />
      <DateField
        label="Hasta"
        value={filter.to}
        onChange={(to) => patch({ to })}
      />

      <Select
        label="Campaña"
        placeholder="Todas"
        options={campaignOptions}
        value={filter.campaignId ?? ""}
        onChange={(e) =>
          patch({ campaignId: e.target.value || undefined })
        }
      />

      <Select
        label="Origen de audiencia"
        placeholder="Todos"
        options={ORIGIN_OPTIONS}
        value={filter.audienceOrigin ?? ""}
        onChange={(e) =>
          patch({
            audienceOrigin:
              (e.target.value as AudienceOrigin) || undefined,
          })
        }
      />

      <Select
        label="Modelo de atribución"
        options={MODEL_OPTIONS}
        value={filter.model ?? AttributionModel.LINEAR}
        onChange={(e) =>
          patch({ model: e.target.value as AttributionModel })
        }
      />

      <Button variant="ghost" onClick={reset} className="ml-auto">
        Limpiar filtros
      </Button>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm text-foreground shadow-sm [color-scheme:dark] focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
      />
    </label>
  );
}
