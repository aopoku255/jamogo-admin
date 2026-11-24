"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  Car,
  CheckCircle2,
  Download,
  Percent,
  UserX,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/ui/Spinner";
import { StatsCard } from "@/components/ui/StatsCard";
import { RangePicker } from "@/components/insights/RangePicker";
import { Nothing, PersonAvatar, Tabs, cedis } from "@/components/detail/parts";
import { useDriversInsights, useRidersInsights } from "@/hooks/useInsights";
import { rangeLabel } from "@/lib/dates";
import { useReportParams } from "@/hooks/useReportParams";
import { downloadCsv } from "@/lib/csv";
import type { DateRange, DriverInsightRow, RiderInsightRow } from "@/lib/types";

export default function InsightsPage() {
  return (
    <RequirePermission permission="analytics.view">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        }
      >
        <Insights />
      </Suspense>
    </RequirePermission>
  );
}

function Insights() {
  const params = useReportParams();
  const { range, setRange, setTab, query } = params;
  const tab = params.tab === "riders" ? "riders" : "drivers";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-xs">
          <Tabs
            tabs={[
              { key: "drivers", label: "Drivers" },
              { key: "riders", label: "Riders" },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>
      {tab === "drivers" ? (
        <DriversTab range={range} query={query} />
      ) : (
        <RidersTab range={range} query={query} />
      )}
    </div>
  );
}

// ---- Sorting ------------------------------------------------------------------

type Column<T> = {
  key: string;
  label: string;
  value: (row: T) => number | string;
  render?: (row: T) => React.ReactNode;
  align?: "right";
};

function useSorted<T>(rows: T[], columns: Column<T>[], initial: string) {
  const [sort, setSort] = useState<{ key: string; desc: boolean }>({
    key: initial,
    desc: true,
  });
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    return [...rows].sort((a, b) => {
      const x = col.value(a);
      const y = col.value(b);
      const cmp =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y));
      return sort.desc ? -cmp : cmp;
    });
  }, [rows, columns, sort]);
  const toggle = (key: string) =>
    setSort((s) => ({ key, desc: s.key === key ? !s.desc : true }));
  return { sorted, sort, toggle };
}

function RankTable<T>({
  rows,
  columns,
  initialSort,
  person,
  emptyText,
}: {
  rows: T[];
  columns: Column<T>[];
  initialSort: string;
  person: (row: T) => {
    href: string;
    name: string;
    sub: string | null;
    avatar: string | null;
  };
  emptyText: string;
}) {
  const { sorted, sort, toggle } = useSorted(rows, columns, initialSort);
  if (rows.length === 0) return <Nothing icon={Users} text={emptyText} />;
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 bg-jamogo-gray-50 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
            <th className="w-10 px-4 py-2.5">#</th>
            <th className="px-4 py-2.5">Name</th>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-2.5 ${c.align === "right" ? "text-right" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(c.key)}
                  className={`inline-flex items-center gap-1 uppercase hover:text-jamogo-ink-900 ${
                    sort.key === c.key ? "text-jamogo-ink-900" : ""
                  }`}
                >
                  {c.label}
                  {sort.key === c.key &&
                    (sort.desc ? (
                      <ArrowDown size={11} />
                    ) : (
                      <ArrowUp size={11} />
                    ))}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const p = person(row);
            return (
              <tr
                key={p.href}
                className="border-b border-jamogo-gray-100 transition-colors last:border-0 hover:bg-jamogo-gray-50"
              >
                <td className="px-4 py-3 text-xs font-semibold text-jamogo-gray-400">
                  {i + 1}
                </td>
                <td className="px-4 py-3">
                  <Link href={p.href} className="group flex items-center gap-3">
                    <PersonAvatar name={p.name} url={p.avatar} size={34} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-jamogo-ink-900 group-hover:text-jamogo-green-600 group-hover:underline">
                        {p.name}
                      </span>
                      {p.sub && (
                        <span className="block truncate text-xs text-jamogo-gray-500">
                          {p.sub}
                        </span>
                      )}
                    </span>
                  </Link>
                </td>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 whitespace-nowrap text-jamogo-ink-900 ${c.align === "right" ? "text-right" : ""}`}
                  >
                    {c.render ? c.render(row) : c.value(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TableCard({
  title,
  description,
  onExport,
  children,
}: {
  title: string;
  description: string;
  onExport?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-jamogo-gray-200 bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <h3 className="font-heading text-base font-semibold text-jamogo-ink-900">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-jamogo-gray-500">{description}</p>
        </div>
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-jamogo-gray-300 bg-card px-3 text-xs font-semibold text-jamogo-ink-900 transition-colors hover:bg-jamogo-gray-50"
          >
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

const pct = (n: number | null) => (n == null ? "—" : `${n}%`);

// ---- Drivers ------------------------------------------------------------------

const DRIVER_COLUMNS: Column<DriverInsightRow>[] = [
  { key: "trips", label: "Trips", value: (r) => r.trips, align: "right" },
  {
    key: "fares",
    label: "Fares",
    value: (r) => r.fares,
    render: (r) => cedis(r.fares),
    align: "right",
  },
  {
    key: "averageFare",
    label: "Avg fare",
    value: (r) => r.averageFare,
    render: (r) => cedis(r.averageFare),
    align: "right",
  },
  {
    key: "commission",
    label: "Commission",
    value: (r) => r.commission,
    render: (r) => cedis(r.commission),
    align: "right",
  },
  {
    key: "sharedRides",
    label: "Shared",
    value: (r) => r.sharedRides,
    align: "right",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    value: (r) => r.cancelled,
    render: (r) => (
      <span className={r.cancelled > 0 ? "text-jamogo-danger" : ""}>
        {r.cancelled}
      </span>
    ),
    align: "right",
  },
  {
    key: "rating",
    label: "Rating",
    value: (r) => r.rating ?? 0,
    render: (r) => (r.rating == null ? "—" : r.rating.toFixed(1)),
    align: "right",
  },
];

function DriversTab({ range, query }: { range: DateRange; query: string }) {
  const { data, isLoading, isFetching } = useDriversInsights(range);
  const t = data?.totals;
  return (
    <div
      className={`space-y-5 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatsCard
          label="Active drivers"
          value={String(t?.activeDrivers ?? 0)}
          icon={Car}
          hint="Finished at least one trip"
          loading={isLoading}
        />
        <StatsCard
          label="Trips completed"
          value={(t?.trips ?? 0).toLocaleString()}
          icon={CheckCircle2}
          hint={t ? `${pct(t.sharedRate)} were shared` : undefined}
          loading={isLoading}
        />
        <StatsCard
          label="Fares collected"
          value={cedis(t?.fares)}
          icon={Wallet}
          hint={t ? `Average ${cedis(t.averageFare)} a trip` : undefined}
          loading={isLoading}
        />
        <StatsCard
          label="Commission charged"
          value={cedis(t?.commission)}
          icon={Percent}
          tone="info"
          hint={
            t ? `${t.cancelledByDrivers} trips cancelled by drivers` : undefined
          }
          loading={isLoading}
        />
      </div>
      <TableCard
        title="Drivers"
        description={`Ranked by fares collected, ${rangeLabel(range)}. Click a column to sort; open a driver for their report.`}
        onExport={
          data?.drivers.length
            ? () =>
                downloadCsv(
                  `jamogo-drivers-${range.from}-to-${range.to}.csv`,
                  [
                    "Driver",
                    "Phone",
                    "Plate",
                    "Trips",
                    "Fares (GHS)",
                    "Average fare",
                    "Commission",
                    "Shared rides",
                    "Cancelled",
                    "Rating",
                    "Owed now",
                  ],
                  data.drivers.map((d) => [
                    d.name,
                    d.phone,
                    d.plate,
                    d.trips,
                    d.fares,
                    d.averageFare,
                    d.commission,
                    d.sharedRides,
                    d.cancelled,
                    d.rating,
                    d.owed,
                  ]),
                )
            : undefined
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <RankTable
            rows={data?.drivers ?? []}
            columns={DRIVER_COLUMNS}
            initialSort="fares"
            emptyText="No driver finished a trip in this period."
            person={(r) => ({
              href: `/insights/drivers/${r.driverId}?${query}`,
              name: r.name,
              sub: [r.plate, r.phone].filter(Boolean).join(" · ") || null,
              avatar: r.avatarUrl,
            })}
          />
        )}
      </TableCard>
    </div>
  );
}

// ---- Riders -------------------------------------------------------------------

const RIDER_COLUMNS: Column<RiderInsightRow>[] = [
  { key: "trips", label: "Trips", value: (r) => r.trips, align: "right" },
  {
    key: "spent",
    label: "Spent",
    value: (r) => r.spent,
    render: (r) => cedis(r.spent),
    align: "right",
  },
  {
    key: "averageFare",
    label: "Avg fare",
    value: (r) => r.averageFare,
    render: (r) => cedis(r.averageFare),
    align: "right",
  },
  {
    key: "sharedRides",
    label: "Shared",
    value: (r) => r.sharedRides,
    align: "right",
  },
  { key: "joined", label: "Joined", value: (r) => r.joined, align: "right" },
  {
    key: "cancelled",
    label: "Cancelled",
    value: (r) => r.cancelled,
    render: (r) => (
      <span className={r.cancelled > 0 ? "text-jamogo-danger" : ""}>
        {r.cancelled}
      </span>
    ),
    align: "right",
  },
  {
    key: "noShows",
    label: "No-shows",
    value: (r) => r.noShows,
    render: (r) => (
      <span className={r.noShows > 0 ? "font-semibold text-jamogo-danger" : ""}>
        {r.noShows}
      </span>
    ),
    align: "right",
  },
];

function RidersTab({ range, query }: { range: DateRange; query: string }) {
  const { data, isLoading, isFetching } = useRidersInsights(range);
  const t = data?.totals;
  return (
    <div
      className={`space-y-5 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatsCard
          label="Active riders"
          value={String(t?.activeRiders ?? 0)}
          icon={Users}
          hint="Took at least one trip"
          loading={isLoading}
        />
        <StatsCard
          label="Trips taken"
          value={(t?.trips ?? 0).toLocaleString()}
          icon={UsersRound}
          hint={t ? `${pct(t.sharedRate)} were shared` : undefined}
          loading={isLoading}
        />
        <StatsCard
          label="Riders spent"
          value={cedis(t?.spent)}
          icon={Wallet}
          hint={t ? `Average ${cedis(t.averageFare)} a trip` : undefined}
          loading={isLoading}
        />
        <StatsCard
          label="Cancelled / no-shows"
          value={t ? `${t.cancelled} / ${t.noShows}` : "0 / 0"}
          icon={t && t.noShows > 0 ? UserX : Ban}
          tone={t && t.noShows > 0 ? "danger" : "neutral"}
          hint="Trips riders called off, and pickups they missed"
          loading={isLoading}
        />
      </div>
      <TableCard
        title="Riders"
        description={`Ranked by what they spent, ${rangeLabel(range)}. Includes shared rides they joined.`}
        onExport={
          data?.riders.length
            ? () =>
                downloadCsv(
                  `jamogo-riders-${range.from}-to-${range.to}.csv`,
                  [
                    "Rider",
                    "Phone",
                    "Trips",
                    "Spent (GHS)",
                    "Average fare",
                    "Shared rides",
                    "Joined",
                    "Cancelled",
                    "No-shows",
                    "Rating",
                  ],
                  data.riders.map((r) => [
                    r.name,
                    r.phone,
                    r.trips,
                    r.spent,
                    r.averageFare,
                    r.sharedRides,
                    r.joined,
                    r.cancelled,
                    r.noShows,
                    r.rating,
                  ]),
                )
            : undefined
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <RankTable
            rows={data?.riders ?? []}
            columns={RIDER_COLUMNS}
            initialSort="spent"
            emptyText="No rider took a trip in this period."
            person={(r) => ({
              href: `/insights/riders/${r.riderId}?${query}`,
              name: r.name,
              sub: r.phone,
              avatar: r.avatarUrl,
            })}
          />
        )}
      </TableCard>
    </div>
  );
}
