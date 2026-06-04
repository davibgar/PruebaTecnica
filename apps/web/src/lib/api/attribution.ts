/** Endpoint de atribución: recálculo de créditos para los tres modelos. */

import type { RecomputeResult } from "../types";
import { request, toQuery } from "./client";

export function recompute(windowDays?: number): Promise<RecomputeResult> {
  const query = toQuery({
    window: windowDays !== undefined ? String(windowDays) : "",
  });
  return request(`/attribution/recompute${query}`, { method: "POST" });
}
