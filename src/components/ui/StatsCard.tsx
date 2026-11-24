import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Tone = "green" | "info" | "warning" | "danger" | "neutral";

const ICON_TONES: Record<Tone, string> = {
  green: "bg-jamogo-green-100 text-jamogo-green-600",
  info: "bg-jamogo-info/12 text-jamogo-info",
  warning: "bg-jamogo-warning/15 text-jamogo-warning",
  danger: "bg-jamogo-danger/12 text-jamogo-danger",
  neutral: "bg-jamogo-gray-100 text-jamogo-gray-500",
};

/**
 * One number with its label and icon, an optional line under it ("from 48
 * trips") and an optional change against the previous period.
 */
export function StatsCard({
  label,
  value,
  icon: Icon,
  tone = "green",
  hint,
  change,
  changeLabel = "vs last period",
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  change?: number;
  changeLabel?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3 rounded-2xl border border-jamogo-gray-200 bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-jamogo-gray-100" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-jamogo-gray-100" />
        </div>
        <div className="h-7 w-28 animate-pulse rounded bg-jamogo-gray-100" />
        <div className="h-3 w-20 animate-pulse rounded bg-jamogo-gray-100" />
      </div>
    );
  }
  const up = (change ?? 0) >= 0;
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-jamogo-gray-200 bg-card p-4 shadow-card sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-jamogo-green-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <span className="text-xs font-medium text-jamogo-gray-500 sm:text-sm">
          {label}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${ICON_TONES[tone]}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <div className="relative mt-3">
        <p className="font-heading text-xl font-bold tracking-tight break-words text-jamogo-ink-900 sm:text-2xl">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-jamogo-gray-500">{hint}</p>}
        {change !== undefined && (
          <p className="mt-1.5 flex items-center gap-1 text-xs">
            <span
              className={`flex items-center font-medium ${up ? "text-jamogo-green-600" : "text-jamogo-danger"}`}
            >
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(change)}%
            </span>
            <span className="text-jamogo-gray-500">{changeLabel}</span>
          </p>
        )}
      </div>
    </div>
  );
}
