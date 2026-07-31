"use client";

export type ChartLegendItem = { key: string; label: string; color: string };

/**
 * A clickable legend — click a pill to hide/show that series. Built as plain
 * buttons (not recharts' <Legend>) so it matches this app's existing filter-pill
 * chrome and gets a real, obvious active/inactive state instead of recharts'
 * default legend styling.
 */
export function ChartLegend({
  items,
  hidden,
  onToggle,
}: {
  items: ChartLegendItem[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => {
        const isHidden = hidden.has(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            aria-pressed={!isHidden}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-jamogo-green-300 ${
              isHidden
                ? "bg-jamogo-gray-100 text-jamogo-gray-400"
                : "bg-jamogo-gray-100 text-jamogo-gray-700 hover:bg-jamogo-gray-200"
            }`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full transition-opacity"
              style={{ backgroundColor: item.color, opacity: isHidden ? 0.3 : 1 }}
            />
            <span className={isHidden ? "line-through" : ""}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
