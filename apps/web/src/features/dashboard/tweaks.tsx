"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export const ACCENTS: Record<string, string> = {
  Esmeralda: "0.78 0.16 162",
  Aguamarina: "0.80 0.13 195",
  Lima: "0.84 0.17 140",
};

export type Density = "compact" | "balanced" | "spacious";

const DENSITY_LABEL: Record<Density, string> = {
  compact: "Densa",
  balanced: "Media",
  spacious: "Amplia",
};

/** FAB + panel de ajustes de diseño (acento de marca y densidad del layout). */
export function Tweaks({
  accent,
  density,
  onAccent,
  onDensity,
}: {
  accent: string;
  density: Density;
  onAccent: (a: string) => void;
  onDensity: (d: Density) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="tweak-fab" onClick={() => setOpen((s) => !s)} title="Ajustes de diseño">
        <Icon name="sliders" size={20} />
      </button>
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 22,
            zIndex: 51,
            width: 232,
            background: "var(--surface-2)",
            border: "1px solid var(--border-2)",
            borderRadius: 14,
            padding: 16,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
            <Icon name="sliders" size={15} /> Tweaks
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
            Acento
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {Object.keys(ACCENTS).map((a) => (
              <button
                key={a}
                onClick={() => onAccent(a)}
                title={a}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "oklch(" + ACCENTS[a] + ")",
                  border: accent === a ? "2px solid var(--text)" : "2px solid transparent",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
            Densidad
          </div>
          <div className="seg" style={{ width: "100%" }}>
            {(["compact", "balanced", "spacious"] as Density[]).map((d) => (
              <button
                key={d}
                className={density === d ? "on" : ""}
                style={{ flex: 1, fontSize: 11 }}
                onClick={() => onDensity(d)}
              >
                {DENSITY_LABEL[d]}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
