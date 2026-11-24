"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "./ChartCard";

type Datum = { status: string; count: number };

function DonutTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { payload: Datum }[];
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { status, count } = payload[0].payload;

  return (
    <div className="rounded-xl border border-jamogo-gray-200 bg-card px-3 py-2 text-xs shadow-card-hover">
      <p className="font-semibold text-jamogo-ink-900 capitalize">{status}</p>
      <p className="text-jamogo-gray-700">
        {count} {count === 1 ? unit : `${unit}s`}
      </p>
    </div>
  );
}

/**
 * A donut, not a bar — legitimate here per the dataviz method's own carve-out
 * ("part-to-whole at a glance, ≤ 6 segments"): these are status compositions
 * of one total (all trips / all submissions), not a close-value comparison,
 * and both charts stay at or under 6 categories. Colors are the fixed status
 * scale (chartColors.ts), not categorical identity.
 */
export function StatusBreakdownChart({
  title,
  subtitle,
  data,
  colors,
  unit = "item",
  stacked = false,
}: {
  title: string;
  subtitle?: string;
  data: Datum[];
  colors: Record<string, string>;
  unit?: string;
  /** Donut above the list, for narrow cards (side by side doesn't fit). */
  stacked?: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="flex h-[180px] items-center justify-center text-sm text-jamogo-gray-500">
          No {unit}s yet
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div
        className={`flex flex-col items-center gap-6 ${stacked ? "" : "sm:flex-row"}`}
      >
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<DonutTooltip unit={unit} />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={data.length > 1 ? 3 : 0}
                cornerRadius={6}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={colors[entry.status] ?? "#9aa39d"}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-heading text-2xl font-bold text-jamogo-ink-900">
              {total}
            </p>
            <p className="text-xs text-jamogo-gray-500">total</p>
          </div>
        </div>

        <div className="w-full flex-1 space-y-2.5">
          {data.map((entry) => {
            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
            return (
              <div
                key={entry.status}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: colors[entry.status] ?? "#9aa39d",
                    }}
                  />
                  <span className="text-jamogo-ink-900 capitalize">
                    {entry.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-jamogo-ink-900">
                    {entry.count}
                  </span>
                  <span className="w-9 text-right text-jamogo-gray-500 tabular-nums">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}
