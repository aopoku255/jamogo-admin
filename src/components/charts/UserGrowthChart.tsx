"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { ChartLegend } from "./ChartLegend";
import { AXIS_TEXT_COLOR, DRIVERS_COLOR, GRID_COLOR, RIDERS_COLOR } from "./chartColors";

function formatDay(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const SERIES = [
  { key: "riders", label: "Riders", color: RIDERS_COLOR },
  { key: "drivers", label: "Drivers", color: DRIVERS_COLOR },
];

export function UserGrowthChart({
  data,
}: {
  data: { date: string; riders: number; drivers: number }[];
}) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const total = data.reduce((sum, d) => sum + d.riders + d.drivers, 0);

  return (
    <ChartCard title="Signups" subtitle="Riders vs. drivers, last 30 days" stat={String(total)}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
            tickLine={false}
            axisLine={false}
            interval={Math.ceil(data.length / 6)}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            content={<ChartTooltip />}
            labelFormatter={(v) => formatDay(String(v))}
            cursor={{ stroke: GRID_COLOR, strokeWidth: 1 }}
          />
          {SERIES.filter((s) => !hidden.has(s.key)).map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#fill-${s.key})`}
              dot={false}
              activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <ChartLegend items={SERIES} hidden={hidden} onToggle={toggle} />
    </ChartCard>
  );
}
