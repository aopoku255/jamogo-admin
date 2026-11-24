import type { DashboardPeriod } from "@/lib/types";

export const PERIOD_OPTIONS: {
  value: DashboardPeriod;
  label: string;
  compare: string;
}[] = [
  { value: "today", label: "Today", compare: "vs yesterday" },
  { value: "week", label: "7 days", compare: "vs previous 7 days" },
  { value: "month", label: "30 days", compare: "vs previous 30 days" },
  { value: "all", label: "All time", compare: "" },
];

/** Segmented Today / 7 days / 30 days / All time control. */
export function PeriodSelect({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Period"
      className="inline-flex rounded-lg border border-jamogo-gray-200 bg-card p-1 shadow-card"
    >
      {PERIOD_OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === o.value
              ? "bg-jamogo-green-500 text-white shadow-sm"
              : "text-jamogo-gray-500 hover:text-jamogo-ink-900"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
