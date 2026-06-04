/** Une clases condicionales (ignora falsy). Evita una dependencia de clsx. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
