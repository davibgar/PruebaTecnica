"use client";

import { toast } from "sonner";
import { Icon, type IconName } from "@/components/ui/icon";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { EmptyState } from "@/components/ui/states";
import { ApiError } from "@/lib/api/client";
import { formatDate, formatRoas } from "@/lib/format";
import type { Recommendation, RecommendationType, Task } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import {
  useAcceptRecommendation,
  useCompleteTask,
  useDismissRecommendation,
  useGenerateRecommendations,
  useRecommendations,
  useReopenTask,
  useTasks,
} from "./queries";

type Severity = "high" | "warn" | "good";

const SEV: Record<RecommendationType, Severity> = {
  pause_low_roas: "high",
  review_reconciliation: "warn",
  scale_best_origin: "good",
};
const SEV_ICON: Record<RecommendationType, IconName> = {
  pause_low_roas: "alert",
  review_reconciliation: "scale",
  scale_best_origin: "target",
};
const SEV_LABEL: Record<Severity, string> = {
  high: "Urgente",
  warn: "Revisar",
  good: "Oportunidad",
};
const SEV_COLOR: Record<Severity, string> = {
  high: "var(--danger)",
  warn: "var(--amber)",
  good: "var(--accent)",
};

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : "Algo salió mal";
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Métrica destacada de la recomendación, derivada del contexto del backend. */
function recMetric(rec: Recommendation): { value: string; label: string } {
  const ctx = rec.context as { roasReal?: number; reconciliationDiffPct?: number };
  if (rec.type === "review_reconciliation") {
    return { value: `${Math.round(ctx.reconciliationDiffPct ?? 0)}%`, label: "Reconciliación" };
  }
  return { value: formatRoas(ctx.roasReal ?? 0), label: "ROAS real" };
}

export function ActionCenter() {
  const { f } = useFilters();
  const recsQuery = useRecommendations();
  const tasksQuery = useTasks();
  const generate = useGenerateRecommendations();

  const openTasks = (tasksQuery.data ?? []).filter((t) => t.status !== "done");

  const onGenerate = () =>
    generate.mutate(f.model, {
      onSuccess: (r) =>
        toast.success(
          r.created > 0
            ? `${r.created} recomendación(es) nueva(s)`
            : "Sin cambios · reglas ya evaluadas",
        ),
      onError: (e) => toast.error(errMsg(e)),
    });

  return (
    <div className="section">
      <div className="section-head">
        <span className="section-title">Action Center</span>
        <span className="section-hint">Recomendaciones de IA estratégica → tasks accionables</span>
        <span className="spacer" />
        {(recsQuery.data?.length ?? 0) > 0 && (
          <span className="count-badge" style={{ marginRight: 4 }}>{recsQuery.data!.length} nuevas</span>
        )}
        <button className="chip-reset" disabled={generate.isPending} onClick={onGenerate} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="spark" size={13} /> {generate.isPending ? "Generando…" : "Generar"}
        </button>
      </div>

      <div className="ac">
        <QueryBoundary query={recsQuery} skeleton={<RecsSkeleton />}>
          {(recs) =>
            recs.length === 0 && openTasks.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon="spark"
                  title="Sin recomendaciones ahora"
                  description="Cuando los datos disparen una regla, aparecerá aquí una acción sugerida."
                />
              </div>
            ) : (
              <>
                {recs.map((r) => (
                  <RecCard key={r.id} rec={r} />
                ))}
              </>
            )
          }
        </QueryBoundary>

        {(tasksQuery.data?.length ?? 0) > 0 && (
          <div style={{ marginTop: 4 }}>
            <div className="sub-h" style={{ margin: "8px 0 10px" }}>
              <Icon name="check" size={14} /> Tasks aceptadas
              <span className="count-badge" style={{ marginLeft: 4 }}>{openTasks.length} abiertas</span>
            </div>
            <div className="tasks">
              {tasksQuery.data!.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecCard({ rec }: { rec: Recommendation }) {
  const accept = useAcceptRecommendation();
  const dismiss = useDismissRecommendation();
  const sev = SEV[rec.type];
  const metric = recMetric(rec);
  const busy = accept.isPending || dismiss.isPending;

  const onAccept = () =>
    accept.mutate(rec.id, {
      onSuccess: () => toast.success("Task creada · " + rec.suggestedOwner),
      onError: (e) => toast.error(errMsg(e)),
    });
  const onDismiss = () =>
    dismiss.mutate(rec.id, {
      onSuccess: () => toast("Recomendación descartada"),
      onError: (e) => toast.error(errMsg(e)),
    });

  return (
    <div className={"rec " + sev}>
      <div className="rec-top">
        <div className="rec-ico"><Icon name={SEV_ICON[rec.type]} size={16} /></div>
        <span className="rec-sev">{SEV_LABEL[sev]}</span>
        <div className="rec-metric">
          <div className="rm-val" style={{ color: SEV_COLOR[sev] }}>{metric.value}</div>
          <div className="rm-lbl">{metric.label}</div>
        </div>
      </div>
      <div className="rec-title">{rec.title}</div>
      <div className="rec-ctx">{rec.cta}</div>
      <div className="rec-meta">
        <span className="owner">
          <span className="avatar">{initials(rec.suggestedOwner)}</span> {rec.suggestedOwner}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="cal" size={13} /> Sugerida {formatDate(rec.suggestedDate)}
        </span>
      </div>
      <div className="rec-actions">
        <button className="btn btn-primary" disabled={busy} onClick={onAccept}>
          <Icon name="check" size={14} /> Aceptar y crear task
        </button>
        <button className="btn btn-ghost" disabled={busy} onClick={onDismiss} title="Descartar">
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const complete = useCompleteTask();
  const reopen = useReopenTask();
  const done = task.status === "done";
  const busy = complete.isPending || reopen.isPending;

  const onToggle = () => {
    if (done) {
      reopen.mutate(task.id, {
        onSuccess: () => toast("Task reabierta"),
        onError: (e) => toast.error(errMsg(e)),
      });
    } else {
      complete.mutate(task.id, {
        onSuccess: () => toast.success("Task completada"),
        onError: (e) => toast.error(errMsg(e)),
      });
    }
  };

  return (
    <div className={"task" + (done ? " done" : "")}>
      <button
        className={"task-check" + (done ? " on" : "")}
        onClick={onToggle}
        disabled={busy}
        title={done ? "Reabrir task" : "Marcar como hecha"}
      >
        {done && <Icon name="check" size={12} />}
      </button>
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span>Vence {formatDate(task.dueDate)}</span>
        </div>
      </div>
      <span className="task-owner">{task.owner}</span>
    </div>
  );
}

function RecsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="rec good" key={i}>
          <div className="skel" style={{ height: 30, width: "40%" }} />
          <div className="skel" style={{ height: 16, width: "80%", marginTop: 12 }} />
          <div className="skel" style={{ height: 36, width: "100%", marginTop: 14 }} />
        </div>
      ))}
    </>
  );
}
