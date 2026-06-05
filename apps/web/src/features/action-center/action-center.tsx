"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/lib/format";
import type { Recommendation, Task } from "@/lib/types";
import { useFilters } from "../filters/filters-context";
import {
  useAcceptRecommendation,
  useCompleteTask,
  useDismissRecommendation,
  useGenerateRecommendations,
  useRecommendations,
  useTasks,
} from "./queries";

/**
 * Action Center: convierte las recomendaciones derivadas del dato real en tasks
 * accionables. Aceptar crea una task; descartar la oculta; completar la cierra.
 * Las mutaciones invalidan la cache y la bandeja se refresca sola.
 */
export function ActionCenter() {
  const { filter } = useFilters();
  const generate = useGenerateRecommendations();

  return (
    <Card>
      <CardHeader
        title="Action Center"
        description="Recomendaciones accionables a partir del ROAS real y la reconciliación."
        action={
          <Button
            variant="secondary"
            disabled={generate.isPending}
            onClick={() => generate.mutate(filter.model)}
          >
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
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Recomendaciones pendientes
      </h3>
      <QueryBoundary
        query={query}
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

  return (
    <li className="rounded-lg border border-slate-200 p-3">
      <p className="text-sm font-medium text-slate-800">{rec.title}</p>
      <p className="mt-1 text-xs text-slate-500">{rec.cta}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <span>{rec.suggestedOwner}</span>
        <span>·</span>
        <span>vence {formatDate(rec.suggestedDate)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          disabled={busy}
          onClick={() => accept.mutate(rec.id)}
        >
          Aceptar
        </Button>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => dismiss.mutate(rec.id)}
        >
          Descartar
        </Button>
      </div>
    </li>
  );
}

function TasksColumn() {
  const query = useTasks();

  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Tasks
      </h3>
      <QueryBoundary query={query}>
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

  return (
    <li className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <p
          className={
            isDone
              ? "text-sm font-medium text-slate-400 line-through"
              : "text-sm font-medium text-slate-800"
          }
        >
          {task.title}
        </p>
        {isDone ? (
          <Badge tone="green">Hecha</Badge>
        ) : (
          <Badge tone="blue">Abierta</Badge>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <span>{task.owner}</span>
        <span>·</span>
        <span>vence {formatDate(task.dueDate)}</span>
      </div>
      {!isDone && (
        <div className="mt-3">
          <Button
            variant="secondary"
            disabled={complete.isPending}
            onClick={() => complete.mutate(task.id)}
          >
            Marcar hecha
          </Button>
        </div>
      )}
    </li>
  );
}
