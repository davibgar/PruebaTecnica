/** Endpoints del Action Center: recomendaciones y tasks. */

import type {
  AttributionModel,
  GenerateResult,
  Recommendation,
  Task,
} from "../types";
import { request, toQuery } from "./client";

export function getRecommendations(): Promise<Recommendation[]> {
  return request(`/action-center/recommendations`);
}

export function generateRecommendations(
  model?: AttributionModel,
): Promise<GenerateResult> {
  const query = toQuery({ model: model ?? "" });
  return request(`/action-center/recommendations/generate${query}`, {
    method: "POST",
  });
}

export function acceptRecommendation(id: string): Promise<Task> {
  return request(`/action-center/recommendations/${id}/accept`, {
    method: "POST",
  });
}

export function dismissRecommendation(id: string): Promise<Recommendation> {
  return request(`/action-center/recommendations/${id}/dismiss`, {
    method: "PATCH",
  });
}

export function getTasks(): Promise<Task[]> {
  return request(`/action-center/tasks`);
}

export function completeTask(id: string): Promise<Task> {
  return request(`/action-center/tasks/${id}/complete`, { method: "PATCH" });
}

export function reopenTask(id: string): Promise<Task> {
  return request(`/action-center/tasks/${id}/reopen`, { method: "PATCH" });
}
