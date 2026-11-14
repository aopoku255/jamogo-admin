"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useShareSearchStats } from "@/hooks/useAnalytics";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { RequirePermission } from "@/components/RequirePermission";
import { ChartCard } from "@/components/charts/ChartCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { StatusBreakdownChart } from "@/components/charts/StatusBreakdownChart";
import { AXIS_TEXT_COLOR, DRIVERS_COLOR, GRID_COLOR, RIDERS_COLOR } from "@/components/charts/chartColors";
import type { ShareSearchOutcome, ShareSearchStats } from "@/lib/types";

const RANGES = [7, 30, 90] as const;

// How each search ended, in plain words, with the app's fixed status colors:
// green for a shared ride, blue for a solo booking, amber/grey for the rest.
const OUTCOMES: { key: ShareSearchOutcome; label: string; color: string }[] = [
  { key: "hosted", label: "Shared (others joined them)", color: "#1fa84c" },
  { key: "joined", label: "Shared (joined someone)", color: "#127a36" },
  { key: "bookedAlone", label: "Booked a driver alone", color: "#2e6be6" },
  { key: "abandoned", label: "Gave up", color: "#f5a623" },
  { key: "searching", label: "Still searching", color: "#9aa39d" },
];

export default function CoRiderSearchPage() {
  return (
    <RequirePermission permission="analytics.view">
      <CoRiderSearchContent />
    </RequirePermission>
  );
}

function CoRiderSearchContent() {
  const [days, setDays] = useState<number>(30);
  const { data, isLoading, isError } = useShareSearchStats(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-jamogo-ink-900">Co-rider search</h1>
          <p className="mt-1 max-w-2xl text-sm text-jamogo-gray-500">
            How &ldquo;Find co-riders&rdquo; searches end. Use it to tune the search time and detour
            limit on the Configurations page.
          </p>
        </div>
        <div className="flex rounded-xl border border-jamogo-gray-200 p-1" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                days === r ? "bg-jamogo-green-500 text-white" : "text-jamogo-gray-700 hover:bg-jamogo-gray-100"
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError || !data ? (
        <Card>
          <p className="text-sm text-jamogo-danger">Couldn&apos;t load co-rider search stats. Try again.</p>
        </Card>
      ) : (
        <Stats data={data} />
      )}
    </div>
  );
}

function Stats({ data }: { data: ShareSearchStats }) {
  const shared = data.outcomes.hosted + data.outcomes.joined;
  const tiles = [
    { label: "Searches", value: String(data.searches), note: `last ${data.days} days` },
    {
      label: "Ended in a shared ride",
      value: data.sharedRate == null ? "—" : `${data.sharedRate}%`,
      note: `${shared} of ${data.searches - data.outcomes.searching} finished searches`,
    },
    {
      label: "Join requests accepted",
      value: String(data.requests.accepted),
      note: `${data.requests.sent} sent · ${data.requests.declined} declined`,
    },
    {
      label: "Joined a car on its way",
      value: String(data.requests.joinedCarOnTheWay),
      note: "rides that already had a driver",
    },
  ];

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <p className="text-sm text-jamogo-gray-500">{t.label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-jamogo-ink-900">{t.value}</p>
            <p className="mt-1 text-xs text-jamogo-gray-500">{t.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusBreakdownChart
          title="How searches ended"
          subtitle={`Last ${data.days} days`}
          data={OUTCOMES.map((o) => ({ status: o.label, count: data.outcomes[o.key] })).filter((d) => d.count > 0)}
          colors={Object.fromEntries(OUTCOMES.map((o) => [o.label, o.color]))}
          unit="search"
        />
        <DailyChart data={data.daily} days={data.days} />
      </div>
    </>
  );
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function DailyChart({ data, days }: { data: ShareSearchStats["daily"]; days: number }) {
  return (
    <ChartCard title="Searches per day" subtitle={`Last ${days} days · shared rides in green`}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
            dataKey="searches"
            name="Searches"
            stroke={DRIVERS_COLOR}
            strokeWidth={2}
            fill={DRIVERS_COLOR}
            fillOpacity={0.08}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="shared"
            name="Shared"
            stroke={RIDERS_COLOR}
            strokeWidth={2}
            fill={RIDERS_COLOR}
            fillOpacity={0.2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
