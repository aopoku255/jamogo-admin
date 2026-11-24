"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Route,
  CheckCircle2,
  Wallet,
  Percent,
  Radio,
  Car,
  UsersRound,
  UserPlus,
  ShieldCheck,
  LifeBuoy,
  Search,
  BarChart3,
} from "lucide-react";
import { usePendingKyc } from "@/hooks/useKyc";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { useUsers } from "@/hooks/useUsers";
import { useDrivers } from "@/hooks/useDrivers";
import { useTrips } from "@/hooks/useTrips";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { useAnalyticsOverview, useDashboard } from "@/hooks/useAnalytics";
import { StatsCard } from "@/components/ui/StatsCard";
import { SectionCard } from "@/components/ui/Card";
import { PeriodSelect, PERIOD_OPTIONS } from "@/components/ui/PeriodSelect";
import { FaresTrendChart } from "@/components/charts/FaresTrendChart";
import { UserGrowthChart } from "@/components/charts/UserGrowthChart";
import { StatusBreakdownChart } from "@/components/charts/StatusBreakdownChart";
import {
  TRIP_STATUS_COLORS,
  KYC_STATUS_COLORS,
} from "@/components/charts/chartColors";
import {
  AttentionItem,
  DriverRow,
  EMPTY_ICONS,
  RiderRow,
  TripRow,
  Widget,
} from "@/components/dashboard/widgets";
import type { DashboardPeriod, Kpi } from "@/lib/types";

const cedis = (n: number) =>
  `GH₵${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: n >= 1000 ? 0 : 2 })}`;
const count = (n: number) => n.toLocaleString();
/** The change only when there is something to compare with. */
const delta = (kpi: Kpi | undefined) =>
  kpi?.change == null ? undefined : kpi.change;

const PERIOD_PHRASE: Record<DashboardPeriod, string> = {
  today: "today",
  week: "in the last 7 days",
  month: "in the last 30 days",
  all: "since launch",
};

export default function DashboardPage() {
  const { hasPermission } = useCurrentAdmin();
  const canAnalytics = hasPermission("analytics.view");
  const canKyc = hasPermission("kyc.review");
  const canSupport = hasPermission("support.manage");
  const canUsers = hasPermission("users.manage");
  const canDrivers = hasPermission("drivers.manage");
  const canTrips = hasPermission("trips.view");

  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const router = useRouter();

  const dashboard = useDashboard(period, canAnalytics);
  const overview = useAnalyticsOverview();
  const kyc = usePendingKyc(canKyc);
  const tickets = useSupportTickets(canSupport);
  const ongoing = useTrips("ongoing", canTrips);
  const matched = useTrips("matched", canTrips);
  const recentTrips = useTrips("all", canTrips);
  const newDrivers = useDrivers(undefined, { limit: 5, offset: 0 }, canDrivers);
  const newRiders = useUsers(undefined, { limit: 5, offset: 0 }, canUsers);

  const d = dashboard.data;
  const k = d?.kpis;
  const loading = dashboard.isLoading;
  const compare = PERIOD_OPTIONS.find((o) => o.value === period)?.compare ?? "";
  const phrase = PERIOD_PHRASE[period];
  const live = [...(ongoing.data ?? []), ...(matched.data ?? [])].slice(0, 5);
  const openTickets = tickets.data?.filter((t) => t.status === "open").length;
  const faresInTrend = d?.trend.reduce((sum, day) => sum + day.fares, 0) ?? 0;

  return (
    <div className="space-y-6">
      {canAnalytics && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-jamogo-gray-500">
              Showing{" "}
              <span className="font-medium text-jamogo-ink-900">{phrase}</span>
              {compare && <>, {compare}</>}. Live numbers refresh every minute.
            </p>
            <PeriodSelect value={period} onChange={setPeriod} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatsCard
              label="Trips requested"
              value={count(k?.tripsRequested.value ?? 0)}
              icon={Route}
              hint={k ? `${count(k.cancelled.value)} cancelled` : undefined}
              change={delta(k?.tripsRequested)}
              changeLabel={compare}
              loading={loading}
            />
            <StatsCard
              label="Completed trips"
              value={count(k?.tripsCompleted.value ?? 0)}
              icon={CheckCircle2}
              hint={
                k ? `Average fare ${cedis(k.averageFare.value)}` : undefined
              }
              change={delta(k?.tripsCompleted)}
              changeLabel={compare}
              loading={loading}
            />
            <StatsCard
              label="Fares collected"
              value={cedis(k?.fares.value ?? 0)}
              icon={Wallet}
              hint="Paid to drivers in cash or MoMo"
              change={delta(k?.fares)}
              changeLabel={compare}
              loading={loading}
            />
            <StatsCard
              label="Commission earned"
              value={cedis(k?.commission.value ?? 0)}
              icon={Percent}
              tone="info"
              hint="Jamogo's share of those fares"
              change={delta(k?.commission)}
              changeLabel={compare}
              loading={loading}
            />
            <Link href="/trips" className="block rounded-2xl">
              <StatsCard
                label="Live trips now"
                value={count(d?.now.liveTrips ?? 0)}
                icon={Radio}
                tone="warning"
                hint={
                  d
                    ? `${count(d.now.searching)} still looking for a driver`
                    : undefined
                }
                loading={loading}
              />
            </Link>
            <Link href="/drivers" className="block rounded-2xl">
              <StatsCard
                label="Drivers online"
                value={count(d?.now.driversOnline ?? 0)}
                icon={Car}
                tone="info"
                hint={d ? `of ${count(d.totals.drivers)} drivers` : undefined}
                loading={loading}
              />
            </Link>
            <StatsCard
              label="Shared rides"
              value={count(k?.sharedRides.value ?? 0)}
              icon={UsersRound}
              hint={
                k?.sharedRides.rate != null
                  ? `${k.sharedRides.rate}% of completed trips`
                  : "No completed trips yet"
              }
              loading={loading}
            />
            <StatsCard
              label="New riders"
              value={count(k?.newRiders.value ?? 0)}
              icon={UserPlus}
              hint={d ? `${count(d.totals.riders)} riders in total` : undefined}
              change={delta(k?.newRiders)}
              changeLabel={compare}
              loading={loading}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <SectionCard
              className="xl:col-span-2"
              title="Fares"
              description={`Completed trips by day, last ${d?.trend.length ?? 14} days`}
              action={
                d && (
                  <p className="font-heading text-2xl font-bold text-jamogo-ink-900">
                    {cedis(faresInTrend)}
                  </p>
                )
              }
            >
              {loading || !d ? (
                <div className="h-[300px] animate-pulse rounded-xl bg-jamogo-gray-50" />
              ) : (
                <FaresTrendChart data={d.trend} />
              )}
            </SectionCard>
            {d && d.tripsByStatus.length > 0 ? (
              <StatusBreakdownChart
                title="Trips by status"
                subtitle={`Requested ${phrase}`}
                data={d.tripsByStatus}
                colors={TRIP_STATUS_COLORS}
                unit="trip"
                stacked
              />
            ) : (
              <SectionCard
                title="Trips by status"
                description={`Requested ${phrase}`}
              >
                <div className="flex h-[220px] flex-col items-center justify-center text-center">
                  <BarChart3 size={22} className="text-jamogo-gray-400" />
                  <p className="mt-2 text-sm text-jamogo-gray-500">
                    {loading ? "Loading…" : `No trips ${phrase} yet`}
                  </p>
                </div>
              </SectionCard>
            )}
          </div>
        </>
      )}

      {(canKyc || canSupport || canDrivers || canAnalytics) && (
        <div>
          <h2 className="mb-3 text-xs font-semibold tracking-wider text-jamogo-gray-500 uppercase">
            Needs attention
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {canKyc && (
              <AttentionItem
                href="/kyc"
                icon={ShieldCheck}
                count={kyc.data?.length}
                label="ID checks waiting for review"
                loading={kyc.isLoading}
              />
            )}
            {canSupport && (
              <AttentionItem
                href="/support"
                icon={LifeBuoy}
                count={openTickets}
                label="Open support tickets"
                loading={tickets.isLoading}
              />
            )}
            {canAnalytics && (
              <AttentionItem
                href="/drivers"
                icon={Car}
                count={d?.now.driversPending}
                label="Drivers awaiting approval"
                loading={loading}
              />
            )}
            {canAnalytics && (
              <AttentionItem
                href="/trips"
                icon={Search}
                count={d?.now.searching}
                label="Riders looking for a driver"
                loading={loading}
              />
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {canTrips && (
          <Widget
            title="Live trips"
            href="/trips"
            loading={ongoing.isLoading || matched.isLoading}
            empty={live.length === 0 && "No trips under way right now"}
            emptyIcon={EMPTY_ICONS.trips}
          >
            {live.map((t) => (
              <TripRow
                key={t.id}
                trip={t}
                live
                onClick={() => router.push(`/trips/${t.id}`)}
              />
            ))}
          </Widget>
        )}
        {canTrips && (
          <Widget
            title="Recent trips"
            href="/trips"
            loading={recentTrips.isLoading}
            empty={(recentTrips.data?.length ?? 0) === 0 && "No trips yet"}
            emptyIcon={EMPTY_ICONS.trips}
          >
            {(recentTrips.data ?? []).slice(0, 5).map((t) => (
              <TripRow
                key={t.id}
                trip={t}
                onClick={() => router.push(`/trips/${t.id}`)}
              />
            ))}
          </Widget>
        )}
        {canDrivers && (
          <Widget
            title="New drivers"
            href="/drivers"
            loading={newDrivers.isLoading}
            empty={
              (newDrivers.data?.drivers.length ?? 0) === 0 && "No drivers yet"
            }
            emptyIcon={EMPTY_ICONS.drivers}
          >
            {(newDrivers.data?.drivers ?? []).map((driver) => (
              <DriverRow
                key={driver.id}
                driver={driver}
                onClick={() => router.push(`/drivers/${driver.id}`)}
              />
            ))}
          </Widget>
        )}
        {canUsers && (
          <Widget
            title="New riders"
            href="/users"
            loading={newRiders.isLoading}
            empty={(newRiders.data?.users.length ?? 0) === 0 && "No riders yet"}
            emptyIcon={EMPTY_ICONS.riders}
          >
            {(newRiders.data?.users ?? []).map((rider) => (
              <RiderRow
                key={rider.id}
                rider={rider}
                onClick={() => router.push(`/users/${rider.id}`)}
              />
            ))}
          </Widget>
        )}
      </div>

      {overview.data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <UserGrowthChart data={overview.data.userGrowth} />
          <StatusBreakdownChart
            title="ID checks by status"
            subtitle="All submissions"
            data={overview.data.kycByStatus}
            colors={KYC_STATUS_COLORS}
            unit="submission"
          />
        </div>
      )}
    </div>
  );
}
