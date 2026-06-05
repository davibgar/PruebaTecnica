import type { CSSProperties } from "react";

/** Iconos stroke (currentColor) portados del design system de NodoTech. */
export const ICONS = {
  analysis: "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3M20 16V6",
  layers: ["M12 3 3 8l9 5 9-5-9-5Z", "M3 13l9 5 9-5", "M3 18l9 5 9-5"],
  audience: [
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M3 20a6 6 0 0 1 12 0",
    "M16 5.5a3 3 0 0 1 0 6",
    "M18 20a6 6 0 0 0-3-5.2",
  ],
  send: ["M22 2 11 13", "M22 2l-7 20-4-9-9-4 20-7Z"],
  funnel: "M3 4h18l-7 8v6l-4 2v-8L3 4Z",
  flag: ["M5 21V4", "M5 4h11l-2 4 2 4H5"],
  spark: [
    "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  ],
  alert: [
    "M12 9v4",
    "M12 17h.01",
    "M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  ],
  scale: [
    "M12 3v18",
    "M5 7h14",
    "M5 7l-3 6a3 3 0 0 0 6 0L5 7Z",
    "M19 7l-3 6a3 3 0 0 0 6 0l-3-6Z",
    "M7 21h10",
  ],
  trend: ["M3 17l6-6 4 4 7-7", "M17 8h4v4"],
  target: [
    "M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0",
    "M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0",
    "M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0",
  ],
  check: "M5 12l4.5 4.5L19 7",
  x: "M6 6l12 12M18 6 6 18",
  chevron: "M9 6l6 6-6 6",
  cal: [
    "M3 9h18",
    "M7 3v3M17 3v3",
    "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
  ],
  money: ["M12 2v20", "M17 6.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3"],
  pulse: "M3 12h4l2 6 4-14 2 8h6",
  bag: ["M6 8h12l1 12H5L6 8Z", "M9 8V6a3 3 0 0 1 6 0v2"],
  ticket: [
    "M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z",
  ],
  reset: ["M3 12a9 9 0 1 0 3-6.7", "M3 4v4h4"],
  sliders: ["M4 6h10M18 6h2", "M4 12h2M10 12h10", "M4 18h7M15 18h5", "M14 4v4M6 10v4M11 16v4"],
  inbox: ["M3 12h5l2 3h4l2-3h5", "M5 5h14l2 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6L5 5Z"],
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  book: ["M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z", "M19 19H6a2 2 0 0 0-2 2"],
  dollar2: [
    "M12 2v20",
    "M16 7a4 4 0 0 0-4-2.5C9.8 4.5 8 5.6 8 7.5S10 10 12 10.5s4 1.3 4 3.5-2 3-4 3a4 4 0 0 1-4-2.5",
  ],
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 18,
  sw = 1.8,
  fill = false,
  style,
}: {
  name: IconName;
  size?: number;
  sw?: number;
  fill?: boolean;
  style?: CSSProperties;
}) {
  const d = ICONS[name];
  const paths: readonly string[] = Array.isArray(d) ? d : [d];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}
