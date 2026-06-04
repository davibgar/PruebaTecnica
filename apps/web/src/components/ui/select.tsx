import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

/** Select nativo estilizado con label opcional. Controlado por el padre. */
export function Select({
  label,
  options,
  placeholder,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-slate-500">{label}</span>
      )}
      <select
        className={cn(
          "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
