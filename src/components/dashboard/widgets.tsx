"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Car, Route, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { initials } from "@/components/layout/UserMenu";
import type { AdminUser, Trip } from "@/lib/types";

export const TRIP_TONE = {
  planning: "neutral",
  searching: "info",
  matched: "info",
  ongoing: "warning",
  completed: "success",
  cancelled: "danger",
} as const;

export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/** A dashboard list: title, "View all", and loading / empty states. */
export function Widget({
  title,
  href,
  loading,
  empty,
  emptyIcon: EmptyIcon,
  children,
}: {
  title: string;
  href?: string;
  loading?: boolean;
  empty?: string | false;
  emptyIcon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-jamogo-gray-200 bg-card shadow-card">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="font-heading text-base font-semibold text-jamogo-ink-900">
          {title}
        </h3>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-0.5 rounded-md px-2 py-1 text-xs font-medium text-jamogo-gray-500 transition-colors hover:bg-jamogo-gray-100 hover:text-jamogo-ink-900"
          >
            View all <ChevronRight size={13} />
          </Link>
        )}
      </div>
      <div className="flex-1 px-3 pb-3">
        {loading ? (
          <div className="space-y-1 px-2 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-jamogo-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-jamogo-gray-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-jamogo-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-jamogo-gray-100 text-jamogo-gray-500">
              <EmptyIcon size={20} />
            </div>
            <p className="mt-3 text-sm font-medium text-jamogo-gray-500">
              {empty}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-jamogo-gray-100">{children}</div>
        )}
      </div>
    </div>
  );
}

function Avatar({
  name,
  url,
  square,
}: {
  name: string;
  url?: string | null;
  square?: boolean;
}) {
  // Falls back to initials when there's no photo or it won't load.
  const [failed, setFailed] = useState(false);
  const shape = square ? "rounded-lg" : "rounded-full";
  if (url && !failed) {
    // Remote photos (R2); next/image would need every storage host whitelisted.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        onError={() => setFailed(true)}
        className={`h-9 w-9 shrink-0 object-cover ${shape}`}
      />
    );
  }
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center bg-jamogo-green-100 text-xs font-bold text-jamogo-green-600 ${shape}`}
    >
      {initials(name)}
    </span>
  );
}

function RowButton({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-jamogo-gray-50"
    >
      {children}
    </button>
  );
}

/** One trip: route, rider and driver, status and fare. `live` adds a pulsing dot. */
export function TripRow({
  trip,
  live,
  onClick,
}: {
  trip: Trip;
  live?: boolean;
  onClick: () => void;
}) {
  return (
    <RowButton onClick={onClick}>
      {live ? (
        <span className="relative ml-1 flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jamogo-green-500 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-jamogo-green-500" />
        </span>
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-jamogo-gray-100 text-jamogo-gray-500">
          <Route size={16} />
        </span>
      )}
      <span className={`min-w-0 flex-1 ${live ? "ml-1.5" : ""}`}>
        <span className="block truncate text-sm font-medium text-jamogo-ink-900">
          {trip.pickupLabel} → {trip.destinationLabel || "…"}
        </span>
        <span className="block truncate text-xs text-jamogo-gray-500">
          {trip.rider?.name ?? "Rider"}
          {trip.acceptedOffer ? ` with ${trip.acceptedOffer.name}` : ""} ·{" "}
          {timeAgo(trip.createdAt)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-semibold text-jamogo-ink-900">
          GH₵{trip.yourOffer}
        </span>
        <Badge tone={TRIP_TONE[trip.status]}>{trip.status}</Badge>
      </span>
    </RowButton>
  );
}

export function DriverRow({
  driver,
  onClick,
}: {
  driver: AdminUser;
  onClick: () => void;
}) {
  const profile = driver.driverProfile;
  const car = [profile?.carMake, profile?.carModel, profile?.plateNumber]
    .filter(Boolean)
    .join(" · ");
  const approval = profile?.approvalStatus;
  return (
    <RowButton onClick={onClick}>
      <span className="relative">
        <Avatar name={driver.name} url={driver.avatarUrl} />
        {profile?.isOnline && (
          <span
            title="Online"
            className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card bg-jamogo-green-500"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-jamogo-ink-900">
          {driver.name}
        </span>
        <span className="block truncate text-xs text-jamogo-gray-500">
          {car || driver.phone} · joined {timeAgo(driver.createdAt)}
        </span>
      </span>
      {approval && (
        <Badge
          tone={
            approval === "approved"
              ? "success"
              : approval === "rejected"
                ? "danger"
                : "warning"
          }
        >
          {approval === "pending" ? "Awaiting approval" : approval}
        </Badge>
      )}
    </RowButton>
  );
}

export function RiderRow({
  rider,
  onClick,
}: {
  rider: AdminUser;
  onClick: () => void;
}) {
  return (
    <RowButton onClick={onClick}>
      <Avatar name={rider.name} url={rider.avatarUrl} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-jamogo-ink-900">
          {rider.name}
        </span>
        <span className="block truncate text-xs text-jamogo-gray-500">
          {rider.phone}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs text-jamogo-gray-500">
          {timeAgo(rider.createdAt)}
        </span>
        {rider.identityStatus === "verified" ? (
          <Badge tone="success">Verified</Badge>
        ) : rider.identityStatus === "pending" ? (
          <Badge tone="warning">ID pending</Badge>
        ) : null}
      </span>
    </RowButton>
  );
}

/** One "needs attention" count: links to the page that clears it. */
export function AttentionItem({
  href,
  icon: Icon,
  count,
  label,
  loading,
}: {
  href: string;
  icon: LucideIcon;
  count: number | undefined;
  label: string;
  loading?: boolean;
}) {
  const busy = !!count && count > 0;
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
        busy
          ? "border-jamogo-warning/30 bg-jamogo-warning/8"
          : "border-jamogo-gray-200 bg-card"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          busy
            ? "bg-jamogo-warning/15 text-jamogo-warning"
            : "bg-jamogo-gray-100 text-jamogo-gray-500"
        }`}
      >
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-lg leading-tight font-bold text-jamogo-ink-900">
          {loading ? "…" : (count ?? 0)}
        </span>
        <span className="block truncate text-xs text-jamogo-gray-500">
          {label}
        </span>
      </span>
      <ChevronRight
        size={15}
        className="text-jamogo-gray-400 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export const EMPTY_ICONS = { trips: Route, drivers: Car, riders: Users };
