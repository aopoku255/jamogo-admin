"use client";

import Link from "next/link";
import { Route } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TRIP_TONE } from "@/components/dashboard/widgets";
import { Nothing, cedis, formatDate } from "./parts";
import type { JoinedTrip, Trip, TripStatus } from "@/lib/types";

export type PersonTripRow = {
  id: string;
  createdAt: string;
  status: TripStatus;
  route: string;
  /** Who else: the driver (for a rider) or the rider (for a driver). */
  other: string | null;
  amount: number | null;
  shared: boolean;
  joined?: boolean;
  note?: string;
};

const sharedWithOthers = (t: Trip) =>
  (t.coRiders ?? []).some((c) => c.status === "accepted");

/** A rider's trips: ones they booked and shared rides they joined, newest first. */
export function riderTripRows(
  booked: (Trip & { paid: number | null })[],
  joined: JoinedTrip[],
): PersonTripRow[] {
  return [
    ...booked.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      status: t.status,
      route: `${t.pickupLabel} → ${t.destinationLabel || "…"}`,
      other: t.acceptedOffer?.name ?? null,
      amount: t.paid,
      shared: t.mode === "share" && sharedWithOthers(t),
    })),
    ...joined.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      status: t.status,
      route: `${t.joinedAs.joinLabel} → ${t.joinedAs.dropoffLabel || t.destinationLabel || "…"}`,
      other: t.acceptedOffer?.name ?? null,
      amount:
        t.status === "completed" && !t.joinedAs.noShow ? t.joinedAs.fare : null,
      shared: true,
      joined: true,
      note: t.joinedAs.noShow
        ? "Didn't show up"
        : `${t.rider?.name ?? "Someone"}'s ride`,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** A driver's trips, with what they collected on each. */
export function driverTripRows(
  trips: (Trip & { takings: number })[],
): PersonTripRow[] {
  return trips.map((t) => ({
    id: t.id,
    createdAt: t.createdAt,
    status: t.status,
    route: `${t.pickupLabel} → ${t.destinationLabel || "…"}`,
    other: t.rider?.name ?? null,
    amount: t.status === "completed" ? t.takings : null,
    shared: t.mode === "share" && sharedWithOthers(t),
  }));
}

export function PersonTrips({
  rows,
  otherLabel,
  amountLabel,
}: {
  rows: PersonTripRow[];
  otherLabel: string;
  amountLabel: string;
}) {
  if (rows.length === 0) return <Nothing icon={Route} text="No trips yet." />;
  return (
    <div className="scrollbar-thin -mx-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-y border-jamogo-gray-200 bg-jamogo-gray-50 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
            <th className="px-6 py-2.5">Date</th>
            <th className="px-4 py-2.5">Route</th>
            <th className="px-4 py-2.5">{otherLabel}</th>
            <th className="px-4 py-2.5 text-right">{amountLabel}</th>
            <th className="px-6 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={`${r.id}-${r.joined ? "j" : "b"}`}
              className="border-b border-jamogo-gray-100 transition-colors last:border-0 hover:bg-jamogo-gray-50"
            >
              <td className="px-6 py-3 whitespace-nowrap text-jamogo-gray-500">
                {formatDate(r.createdAt, true)}
              </td>
              <td className="max-w-[280px] px-4 py-3">
                <Link
                  href={`/trips/${r.id}`}
                  className="block truncate font-medium text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
                >
                  {r.route}
                </Link>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-jamogo-gray-500">
                  {r.shared && (
                    <span className="rounded bg-jamogo-green-50 px-1.5 py-px font-semibold text-jamogo-green-600">
                      {r.joined ? "Joined" : "Shared"}
                    </span>
                  )}
                  {r.note}
                </span>
              </td>
              <td className="px-4 py-3 text-jamogo-ink-900">
                {r.other ?? "—"}
              </td>
              <td className="px-4 py-3 text-right font-medium whitespace-nowrap text-jamogo-ink-900">
                {r.amount == null ? "—" : cedis(r.amount)}
              </td>
              <td className="px-6 py-3">
                <Badge tone={TRIP_TONE[r.status]}>{r.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
