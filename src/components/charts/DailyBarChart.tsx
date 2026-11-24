"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TEXT_COLOR, GRID_COLOR, RIDERS_COLOR } from "./chartColors";

function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * One measure by day (one series, so the title names it; no legend). Hover a
 * day for its value and trip count.
 */
export function DailyBarChart<T extends { date: string; trips: number }>({
  data,
  dataKey,
  label,
  format,
  height = 240,
}: {
  data: T[];
  dataKey: keyof T & string;
  label: string;
  format: (n: number) => string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        barCategoryGap="25%"
      >
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
          tickLine={false}
          axisLine={false}
          width={44}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "var(--color-gray-100)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as T;
            return (
              <div className="rounded-xl border border-jamogo-gray-200 bg-card px-3 py-2 text-xs shadow-card-hover">
                <p className="mb-1 font-semibold text-jamogo-ink-900">
                  {formatDay(d.date)}
                </p>
                <p className="text-jamogo-gray-700">
                  {label}:{" "}
                  <span className="font-medium text-jamogo-ink-900">
                    {format(Number(d[dataKey]))}
                  </span>
                </p>
                <p className="text-jamogo-gray-700">
                  {d.trips} trip{d.trips === 1 ? "" : "s"}
                </p>
              </div>
            );
          }}
        />
        <Bar
          dataKey={(d: T) => Number(d[dataKey])}
          name={label}
          fill={RIDERS_COLOR}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
