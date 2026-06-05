"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptRecommendation,
  completeTask,
  dismissRecommendation,
  generateRecommendations,
  getRecommendations,
  getTasks,
} from "@/lib/api/action-center";
import { queryKeys } from "@/lib/query-keys";
import type { AttributionModel } from "@/lib/types";

export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations(),
    queryFn: getRecommendations,
  });
}

export function useTasks() {
  return useQuery({ queryKey: queryKeys.tasks(), queryFn: getTasks });
}

/** Invalida recomendaciones y tasks tras cualquier mutación que las afecte. */
function useInvalidateActionCenter() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.recommendations() });
    void client.invalidateQueries({ queryKey: queryKeys.tasks() });
  };
}

export function useGenerateRecommendations() {
  const invalidate = useInvalidateActionCenter();
  return useMutation({
    mutationFn: (model?: AttributionModel) => generateRecommendations(model),
    onSuccess: invalidate,
  });
}

export function useAcceptRecommendation() {
  const invalidate = useInvalidateActionCenter();
  return useMutation({
    mutationFn: (id: string) => acceptRecommendation(id),
    onSuccess: invalidate,
  });
}

export function useDismissRecommendation() {
  const invalidate = useInvalidateActionCenter();
  return useMutation({
    mutationFn: (id: string) => dismissRecommendation(id),
    onSuccess: invalidate,
  });
}

export function useCompleteTask() {
  const invalidate = useInvalidateActionCenter();
  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: invalidate,
  });
}
