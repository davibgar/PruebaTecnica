/** Etiquetas legibles para los enums del dominio (UI). */

import { AttributionModel, AudienceOrigin } from "./types";

export const MODEL_LABELS: Record<AttributionModel, string> = {
  [AttributionModel.LINEAR]: "Lineal",
  [AttributionModel.TIME_DECAY]: "Time-decay",
  [AttributionModel.POSITION_BASED]: "Position-based",
};

export const ORIGIN_LABELS: Record<AudienceOrigin, string> = {
  [AudienceOrigin.COLD]: "Frías",
  [AudienceOrigin.WARM]: "Warm",
  [AudienceOrigin.OWNED]: "Base propia",
};

/** Color por origen de audiencia (variables CSS del design system). */
export const ORIGIN_COLOR: Record<string, string> = {
  [AudienceOrigin.COLD]: "var(--o-fria)",
  [AudienceOrigin.WARM]: "var(--o-warm)",
  [AudienceOrigin.OWNED]: "var(--o-base_propia)",
};

const CHANNEL_LABELS: Record<string, string> = {
  meta: "Meta",
  google: "Google",
  tiktok: "TikTok",
  email: "Email",
  whatsapp: "WhatsApp",
  organico: "Orgánico",
};

export function channelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] ?? channel;
}

export function originLabel(origin: AudienceOrigin): string {
  return ORIGIN_LABELS[origin] ?? origin;
}
