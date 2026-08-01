"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck, LifeBuoy, Users, Car, Route } from "lucide-react";
import { usePendingKyc } from "@/hooks/useKyc";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { useUsers } from "@/hooks/useUsers";
import { useDrivers } from "@/hooks/useDrivers";
import { useTrips } from "@/hooks/useTrips";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { useAnalyticsOverview } from "@/hooks/useAnalytics";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { UserGrowthChart } from "@/components/charts/UserGrowthChart";
import { TripsByDayChart } from "@/components/charts/TripsByDayChart";
import { StatusBreakdownChart } from "@/components/charts/StatusBreakdownChart";
import { TRIP_STATUS_COLORS, KYC_STATUS_COLORS } from "@/components/charts/chartColors";

export default function DashboardPage() {
  const { hasPermission } = useCurrentAdmin();
  const canKyc = hasPermission("kyc.review");
  const canSupport = hasPermission("support.manage");
  const canUsers = hasPermission("users.manage");
  const canDrivers = hasPermission("drivers.manage");
  const canTrips = hasPermission("trips.view");

  const kyc = usePendingKyc(canKyc);
  const tickets = useSupportTickets(canSupport);
  const users = useUsers(undefined, undefined, canUsers);
  const drivers = useDrivers(undefined, undefined, canDrivers);
  const trips = useTrips(undefined, canTrips);
  const analytics = useAnalyticsOverview();

  const openTicketCount = tickets.data?.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {canKyc && (
          <StatCard
            icon={ShieldCheck}
            label="Pending KYC reviews"
            value={kyc.data?.length}
            isLoading={kyc.isLoading}
            isError={kyc.isError}
            href="/kyc"
          />
        )}
        {canSupport && (
          <StatCard
            icon={LifeBuoy}
            label="Open support tickets"
            value={openTicketCount}
            isLoading={tickets.isLoading}
            isError={tickets.isError}
            href="/support"
          />
        )}
        {canUsers && (
          <StatCard
            icon={Users}
            label="Riders"
            value={users.data?.total}
            isLoading={users.isLoading}
            isError={users.isError}
            href="/users"
          />
        )}
        {canDrivers && (
          <StatCard
            icon={Car}
            label="Drivers"
            value={drivers.data?.total}
            isLoading={drivers.isLoading}
            isError={drivers.isError}
            href="/drivers"
          />
        )}
        {canTrips && (
          <StatCard
            icon={Route}
            label="Trips"
            value={trips.data?.length}
            isLoading={trips.isLoading}
            isError={trips.isError}
            href="/trips"
          />
        )}
      </div>

      {analytics.data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <UserGrowthChart data={analytics.data.userGrowth} />
          <TripsByDayChart data={analytics.data.tripsByDay} />
          <StatusBreakdownChart
            title="Trips by status"
            data={analytics.data.tripsByStatus}
            colors={TRIP_STATUS_COLORS}
            unit="trip"
          />
          <StatusBreakdownChart
            title="KYC submissions by status"
            data={analytics.data.kycByStatus}
            colors={KYC_STATUS_COLORS}
            unit="submission"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
  isError,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center justify-between transition-colors hover:border-jamogo-green-300">
        <div>
          <p className="text-sm text-jamogo-gray-500">{label}</p>
          <div className="mt-2 font-heading text-3xl font-bold text-jamogo-ink-900">
            {isLoading ? (
              <Spinner />
            ) : isError ? (
              <span className="text-jamogo-danger">—</span>
            ) : (
              value
            )}
          </div>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-jamogo-green-50 text-jamogo-green-600">
          <Icon size={22} />
        </div>
      </Card>
    </Link>
  );
}
