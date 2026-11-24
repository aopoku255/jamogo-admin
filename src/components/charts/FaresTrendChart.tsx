"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_TEXT_COLOR,
  DRIVERS_COLOR,
  GRID_COLOR,
  RIDERS_COLOR,
} from "./chartColors";
import { ChartLegend } from "./ChartLegend";

type Day = { date: string; fares: number; commission: number; trips: number };

const cedis = (n: number) =>
  `GH₵${n.toLocaleString(undefined, { maximumFractionDigits: n >= 100 ? 0 : 2 })}`;

function formatDay(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Day & { kept: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-jamogo-gray-200 bg-card px-3 py-2 text-xs shadow-card-hover">
      <p className="mb-1 font-semibold text-jamogo-ink-900">
        {formatDay(d.date)}
      </p>
      <Row color={RIDERS_COLOR} label="Kept by drivers" value={cedis(d.kept)} />
      <Row
        color={DRIVERS_COLOR}
        label="Commission"
        value={cedis(d.commission)}
      />
      <div className="mt-1 border-t border-jamogo-gray-200 pt-1 text-jamogo-gray-700">
        Fares{" "}
        <span className="font-medium text-jamogo-ink-900">
          {cedis(d.fares)}
        </span>{" "}
        · {d.trips} trip{d.trips === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function Row({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-jamogo-gray-700">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}:</span>
      <span className="font-medium text-jamogo-ink-900">{value}</span>
    </div>
  );
}

/**
 * Fares from completed trips, by day, split into what drivers kept and
 * Jamogo's commission. A stack because the two add up to the day's fares
 * (same unit, one axis); the categorical green/blue pair is the one already
 * validated for the riders/drivers charts.
 */
export function FaresTrendChart({ data }: { data: Day[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const rows = data.map((d) => ({
    ...d,
    kept: Math.max(0, d.fares - d.commission),
  }));
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={rows}
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
            tickFormatter={(v: number) =>
              v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v)
            }
            tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ fill: "var(--color-gray-100)" }}
          />
          <Bar
            dataKey="kept"
            name="Kept by drivers"
            stackId="fares"
            fill={RIDERS_COLOR}
            stroke="var(--color-card)"
            strokeWidth={2}
            hide={hidden.has("kept")}
          />
          <Bar
            dataKey="commission"
            name="Commission"
            stackId="fares"
            fill={DRIVERS_COLOR}
            stroke="var(--color-card)"
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
            hide={hidden.has("commission")}
          />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend
        items={[
          { key: "kept", label: "Kept by drivers", color: RIDERS_COLOR },
          {
            key: "commission",
            label: "Jamogo commission",
            color: DRIVERS_COLOR,
          },
        ]}
        hidden={hidden}
        onToggle={toggle}
      />
    </div>
  );
}
