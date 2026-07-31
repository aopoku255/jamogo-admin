"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { AXIS_TEXT_COLOR, GRID_COLOR, RIDERS_COLOR } from "./chartColors";

function formatDay(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TripsByDayChart({ data }: { data: { date: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard title="Trips requested" subtitle="Last 30 days" stat={String(total)}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fill-trips" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={RIDERS_COLOR} stopOpacity={0.28} />
              <stop offset="100%" stopColor={RIDERS_COLOR} stopOpacity={0} />
            </linearGradient>
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
          <Area
            type="monotone"
            dataKey="count"
            name="Trips"
            stroke={RIDERS_COLOR}
            strokeWidth={2}
            fill="url(#fill-trips)"
            dot={false}
            activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
