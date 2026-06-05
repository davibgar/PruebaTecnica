import { cn } from "@/lib/cn";

/**
 * Iconografía a base de emojis de Apple, autohospedados en `public/emoji/`
 * (sin dependencia de CDN). Renderiza un `<img>` para que se vean estilo Apple
 * en cualquier sistema operativo, no solo en macOS/iOS.
 */
export type EmojiName =
  | "money-bag"
  | "money-with-wings"
  | "chart-increasing"
  | "chart-decreasing"
  | "bar-chart"
  | "chart-yen"
  | "shopping-cart"
  | "receipt"
  | "clipboard"
  | "people"
  | "fire"
  | "trophy"
  | "warning"
  | "light-bulb"
  | "check"
  | "cross"
  | "pushpin"
  | "speech"
  | "sparkles"
  | "inbox"
  | "page"
  | "search"
  | "knobs"
  | "target"
  | "rocket";

export function Emoji({
  name,
  size = 18,
  className,
  label,
}: {
  name: EmojiName;
  size?: number;
  className?: string;
  /** Texto accesible. Si se omite, el emoji es decorativo (aria-hidden). */
  label?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/emoji/${name}.png`}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      className={cn("inline-block select-none align-[-0.15em]", className)}
    />
  );
}
