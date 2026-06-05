"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Emoji, type EmojiName } from "@/components/ui/emoji";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { Recommendation, RecommendationType, Task } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import {
  useAcceptRecommendation,
  useCompleteTask,
  useDismissRecommendation,
  useGenerateRecommendations,
  useRecommendations,
  useTasks,
} from "./queries";

const TYPE_ICON: Record<RecommendationType, EmojiName> = {
  pause_low_roas: "chart-decreasing",
  scale_best_origin: "rocket",
  review_reconciliation: "warning",
};

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : "Algo salió mal";
}

/**
 * Action Center: convierte las recomendaciones derivadas del dato real en tasks
 * accionables. Aceptar crea una task; descartar la oculta; completar la cierra.
 * Cada acción dispara un toast e invalida la cache para refrescar la bandeja.
 */
export function ActionCenter() {
  const { filter } = useFilters();
  const generate = useGenerateRecommendations();

  const onGenerate = () =>
    generate.mutate(filter.model, {
      onSuccess: (r) =>
        toast.success(
          r.created > 0
            ? `${r.created} recomendación(es) nueva(s)`
            : "Sin cambios · ya estaban evaluadas",
        ),
      onError: (e) => toast.error(errMsg(e)),
    });

  return (
    <Card>
      <CardHeader
        icon="light-bulb"
        eyebrow="Capa cross-módulo"
        title="Action Center"
        description="Recomendaciones accionables a partir del ROAS real y la reconciliación."
        action={
          <Button
            variant="secondary"
            disabled={generate.isPending}
            onClick={onGenerate}
          >
            <Emoji name="sparkles" size={14} />
            {generate.isPending ? "Generando…" : "Generar recomendaciones"}
          </Button>
        }
      />
      <CardBody className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecommendationsColumn />
        <TasksColumn />
      </CardBody>
    </Card>
  );
}

function RecommendationsColumn() {
  const query = useRecommendations();

  return (
    <section>
      <h3 className="eyebrow mb-3">Recomendaciones pendientes</h3>
      <QueryBoundary
        query={query}
        skeleton={<ListSkeleton items={3} />}
        isEmpty={(rows) => rows.length === 0}
        emptyTitle="Sin recomendaciones pendientes"
        emptyDescription="Pulsa «Generar recomendaciones» para evaluar las reglas."
      >
        {(rows) => (
          <ul className="space-y-3">
            {rows.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </ul>
        )}
      </QueryBoundary>
    </section>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const accept = useAcceptRecommendation();
  const dismiss = useDismissRecommendation();
  const busy = accept.isPending || dismiss.isPending;

  const onAccept = () =>
    accept.mutate(rec.id, {
      onSuccess: () => toast.success("Aceptada · task creada"),
      onError: (e) => toast.error(errMsg(e)),
    });

  const onDismiss = () =>
    dismiss.mutate(rec.id, {
      onSuccess: () => toast("Recomendación descartada"),
      onError: (e) => toast.error(errMsg(e)),
    });

  return (
    <li className="rounded-xl border border-border bg-surface-2/40 p-3.5 transition-colors hover:border-border-strong">
      <p className="flex items-start gap-2 text-sm font-medium text-foreground">
        <Emoji name={TYPE_ICON[rec.type]} size={15} className="mt-0.5 shrink-0" />
        {rec.title}
      </p>
      <p className="mt-1 pl-6 text-xs text-muted">{rec.cta}</p>
      <div className="mt-2 flex items-center gap-2 pl-6 text-[11px] text-muted/80">
        <span>{rec.suggestedOwner}</span>
        <span>·</span>
        <span>vence {formatDate(rec.suggestedDate)}</span>
      </div>
      <div className="mt-3 flex gap-2 pl-6">
        <Button variant="brand" disabled={busy} onClick={onAccept}>
          <Emoji name="check" size={13} /> Aceptar
        </Button>
        <Button variant="danger" disabled={busy} onClick={onDismiss}>
          <Emoji name="cross" size={13} /> Descartar
        </Button>
      </div>
    </li>
  );
}

function TasksColumn() {
  const query = useTasks();

  return (
    <section>
      <h3 className="eyebrow mb-3">Tasks</h3>
      <QueryBoundary query={query} skeleton={<ListSkeleton items={2} />}>
        {(rows) =>
          rows.length === 0 ? (
            <EmptyState
              title="Sin tasks"
              description="Acepta una recomendación para crear una task."
            />
          ) : (
            <ul className="space-y-3">
              {rows.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </ul>
          )
        }
      </QueryBoundary>
    </section>
  );
}

function TaskCard({ task }: { task: Task }) {
  const complete = useCompleteTask();
  const isDone = task.status === "done";

  const onComplete = () =>
    complete.mutate(task.id, {
      onSuccess: () => toast.success("Task completada"),
      onError: (e) => toast.error(errMsg(e)),
    });

  return (
    <li className="rounded-xl border border-border bg-surface-2/40 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p
          className={
            isDone
              ? "flex items-center gap-2 text-sm font-medium text-muted line-through"
              : "flex items-center gap-2 text-sm font-medium text-foreground"
          }
        >
          <Emoji name={isDone ? "check" : "pushpin"} size={14} className="shrink-0" />
          {task.title}
        </p>
        {isDone ? (
          <Badge tone="green">Hecha</Badge>
        ) : (
          <Badge tone="blue">Abierta</Badge>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 pl-6 text-[11px] text-muted/80">
        <span>{task.owner}</span>
        <span>·</span>
        <span>vence {formatDate(task.dueDate)}</span>
      </div>
      {!isDone && (
        <div className="mt-3 pl-6">
          <Button
            variant="secondary"
            disabled={complete.isPending}
            onClick={onComplete}
          >
            <Emoji name="check" size={13} /> Marcar hecha
          </Button>
        </div>
      )}
    </li>
  );
}
