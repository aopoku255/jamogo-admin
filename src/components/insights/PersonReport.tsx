"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  Percent,
  Route,
  UserX,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/Button";
import { FaresTrendChart } from "@/components/charts/FaresTrendChart";
import { DailyBarChart } from "@/components/charts/DailyBarChart";
import {
  BackLink,
  Nothing,
  PersonAvatar,
  cedis,
  formatDate,
} from "@/components/detail/parts";
import { RangePicker } from "./RangePicker";
import { useDriverReport, useRiderReport } from "@/hooks/useInsights";
import { useReportParams } from "@/hooks/useReportParams";
import { rangeLabel } from "@/lib/dates";
import { ApiError } from "@/lib/api";
import type { CommissionStatement, DateRange } from "@/lib/types";

function Shell({
  name,
  avatar,
  sub,
  profileHref,
  range,
  onRange,
  onDownload,
  downloadLabel,
  backTab,
  children,
}: {
  name: string;
  avatar: string | null | undefined;
  sub: string;
  profileHref: string;
  range: DateRange;
  onRange: (r: DateRange) => void;
  onDownload: () => Promise<void>;
  downloadLabel: string;
  backTab: "drivers" | "riders";
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const { query } = useReportParams();
  return (
    <div className="space-y-5">
      <BackLink href={`/insights?${query}&tab=${backTab}`} label="Insights" />
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-jamogo-gray-200 bg-card p-5 shadow-card">
        <PersonAvatar name={name} url={avatar} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xl font-bold tracking-tight text-jamogo-ink-900">
            {name}
          </h1>
          <p className="mt-0.5 text-sm text-jamogo-gray-500">
            {sub} ·{" "}
            <Link
              href={profileHref}
              className="inline-flex items-center gap-0.5 font-medium text-jamogo-green-600 hover:underline"
            >
              Open profile <ArrowUpRight size={13} />
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RangePicker value={range} onChange={onRange} />
          <Button
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onDownload();
              } catch {
                toast.error("Couldn't make the PDF. Try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? <Spinner className="h-4 w-4" /> : <Download size={16} />}{" "}
            {downloadLabel}
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-24">
      <Spinner />
    </div>
  );
}

function NotFound({ error, what }: { error: unknown; what: string }) {
  return (
    <div className="space-y-4">
      <BackLink href="/insights" label="Insights" />
      <Nothing
        icon={UserX}
        text={
          error instanceof ApiError && error.status === 404
            ? `This ${what} doesn't exist.`
            : `Couldn't load this report. Try refreshing.`
        }
      />
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-jamogo-gray-200 bg-card px-5 py-4 shadow-card">
      <h3 className="font-heading text-base font-semibold text-jamogo-ink-900">
        {title}
      </h3>
      {description && (
        <p className="mt-0.5 text-xs text-jamogo-gray-500">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TripsTable({
  rows,
}: {
  rows: {
    key: string;
    href: string;
    when: string;
    route: string;
    tag?: string;
    who: string;
    amount: number;
  }[];
}) {
  if (rows.length === 0)
    return <Nothing icon={Route} text="No trips in this period." />;
  return (
    <div className="scrollbar-thin -mx-5 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.key}
              className="border-t border-jamogo-gray-100 transition-colors hover:bg-jamogo-gray-50"
            >
              <td className="px-5 py-2.5 whitespace-nowrap text-jamogo-gray-500">
                {formatDate(r.when, true)}
              </td>
              <td className="max-w-[260px] px-3 py-2.5">
                <Link
                  href={r.href}
                  className="block truncate font-medium text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
                >
                  {r.route}
                </Link>
                {r.tag && (
                  <span className="text-xs text-jamogo-green-600">{r.tag}</span>
                )}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-jamogo-gray-700">
                {r.who}
              </td>
              <td className="px-5 py-2.5 text-right font-medium whitespace-nowrap text-jamogo-ink-900">
                {cedis(r.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatementCard({
  s,
  range,
}: {
  s: CommissionStatement;
  range: DateRange;
}) {
  const line = (label: string, value: string, strong = false) => (
    <div
      className={`flex justify-between py-2 text-sm ${strong ? "font-semibold text-jamogo-ink-900" : "text-jamogo-gray-700"}`}
    >
      <span>{label}</span>
      <span className="text-jamogo-ink-900">{value}</span>
    </div>
  );
  return (
    <Card title="Commission statement" description={rangeLabel(range)}>
      <div className="divide-y divide-jamogo-gray-100">
        {line("Owed at the start", cedis(s.opening))}
        {line("+ Charged on trips", cedis(s.charged))}
        {line("− Paid by MoMo", cedis(s.paid))}
        {line("− Cleared by Jamogo", cedis(s.waived))}
      </div>
      <div
        className={`mt-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold ${
          s.closing > 0.005
            ? "bg-jamogo-warning/12 text-jamogo-ink-900"
            : "bg-jamogo-green-50 text-jamogo-green-600"
        }`}
      >
        <span>Owed at the end</span>
        <span>{s.closing > 0.005 ? cedis(s.closing) : "Settled"}</span>
      </div>
    </Card>
  );
}

/** One driver over a period: their numbers, daily fares, trips and commission statement. */
export function DriverReportPage({ id }: { id: string }) {
  const { range, setRange } = useReportParams();
  const { data, isLoading, error, isFetching } = useDriverReport(id, range);
  if (isLoading) return <Loading />;
  if (!data) return <NotFound error={error} what="driver" />;
  const { driver, summary, statement } = data;
  return (
    <Shell
      name={driver.name}
      avatar={driver.avatarUrl}
      sub={[driver.phone, driver.driverProfile?.plateNumber]
        .filter(Boolean)
        .join(" · ")}
      profileHref={`/drivers/${driver.id}`}
      range={range}
      onRange={setRange}
      downloadLabel="Statement PDF"
      backTab="drivers"
      onDownload={async () => {
        const { downloadDriverStatement } = await import("@/lib/pdf");
        await downloadDriverStatement(data);
      }}
    >
      <div
        className={`space-y-5 transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatsCard
            label="Trips completed"
            value={String(summary.trips)}
            icon={CheckCircle2}
            hint={`${summary.ridersCarried} riders carried`}
          />
          <StatsCard
            label="Fares collected"
            value={cedis(summary.fares)}
            icon={Wallet}
            hint={`Average ${cedis(summary.averageFare)}`}
          />
          <StatsCard
            label="Commission charged"
            value={cedis(statement.charged)}
            icon={Percent}
            tone="info"
            hint={`${cedis(statement.closing)} owed at the end`}
          />
          <StatsCard
            label="Shared rides"
            value={String(summary.sharedRides)}
            icon={UsersRound}
            hint={
              summary.trips
                ? `${Math.round((summary.sharedRides / summary.trips) * 100)}% of trips`
                : "No trips"
            }
          />
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <Card
              title="Fares by day"
              description="What they collected, and the commission on it"
            >
              <FaresTrendChart data={data.daily} />
            </Card>
          </div>
          <StatementCard s={statement} range={range} />
        </div>
        <Card title={`Trips (${data.trips.length})`}>
          <TripsTable
            rows={data.trips.map((t) => ({
              key: t.id,
              href: `/trips/${t.id}`,
              when: t.completedAt,
              route: `${t.pickupLabel} → ${t.destinationLabel || "…"}`,
              tag: t.shared ? `Shared · ${t.riders} riders` : undefined,
              who: t.rider?.name ?? "",
              amount: t.fares,
            }))}
          />
        </Card>
      </div>
    </Shell>
  );
}

/** One rider over a period: trips, spending by day, and every trip they took. */
export function RiderReportPage({ id }: { id: string }) {
  const { range, setRange } = useReportParams();
  const { data, isLoading, error, isFetching } = useRiderReport(id, range);
  if (isLoading) return <Loading />;
  if (!data) return <NotFound error={error} what="rider" />;
  const { rider, summary } = data;
  return (
    <Shell
      name={rider.name}
      avatar={rider.avatarUrl}
      sub={rider.phone}
      profileHref={`/users/${rider.id}`}
      range={range}
      onRange={setRange}
      downloadLabel="Trips PDF"
      backTab="riders"
      onDownload={async () => {
        const { downloadRiderHistory } = await import("@/lib/pdf");
        await downloadRiderHistory(data);
      }}
    >
      <div
        className={`space-y-5 transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatsCard
            label="Trips taken"
            value={String(summary.trips)}
            icon={CheckCircle2}
            hint={`${summary.joined} joined someone else's ride`}
          />
          <StatsCard
            label="Spent"
            value={cedis(summary.spent)}
            icon={Wallet}
            hint="Paid to drivers"
          />
          <StatsCard
            label="Average fare"
            value={cedis(summary.averageFare)}
            icon={Users}
          />
          <StatsCard
            label="Shared rides"
            value={String(summary.sharedRides)}
            icon={UsersRound}
            hint={
              summary.trips
                ? `${Math.round((summary.sharedRides / summary.trips) * 100)}% of trips`
                : "No trips"
            }
          />
        </div>
        <Card title="Spending by day" description={rangeLabel(range)}>
          <DailyBarChart
            data={data.daily}
            dataKey="spent"
            label="Spent"
            format={(n) => cedis(n)}
          />
        </Card>
        <Card title={`Trips (${data.trips.length})`}>
          <TripsTable
            rows={data.trips.map((t) => ({
              key: `${t.id}-${t.joined ? "j" : "b"}`,
              href: `/trips/${t.id}`,
              when: t.completedAt,
              route: `${t.pickupLabel} → ${t.destinationLabel || "…"}`,
              tag: t.joined
                ? "Joined a shared ride"
                : t.shared
                  ? "Shared"
                  : undefined,
              who: t.driver?.name ?? "",
              amount: t.paid,
            }))}
          />
        </Card>
      </div>
    </Shell>
  );
}
