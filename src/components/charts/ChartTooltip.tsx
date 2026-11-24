type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-jamogo-gray-200 bg-card px-3 py-2 text-xs shadow-card-hover">
      {label && <p className="mb-1 font-semibold text-jamogo-ink-900">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-jamogo-gray-700">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}:</span>
          <span className="font-medium text-jamogo-ink-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
