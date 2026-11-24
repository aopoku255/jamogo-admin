"use client";

import Link from "next/link";
import {
  Ban,
  Car,
  CheckCircle2,
  Clock,
  Flag,
  MapPin,
  MessageSquare,
  Navigation,
  Percent,
  Route,
  Search,
  ShieldAlert,
  Star,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { StatsCard } from "@/components/ui/StatsCard";
import { TRIP_TONE } from "@/components/dashboard/widgets";
import { useTripDetail } from "@/hooks/useTrips";
import { ApiError } from "@/lib/api";
import {
  BackLink,
  CopyId,
  InfoRow,
  Nothing,
  PersonAvatar,
  Timeline,
  cedis,
  formatDate,
  formatTime,
  type TimelineStep,
} from "./parts";
import type { TripDetail } from "@/lib/types";

type FullTrip = TripDetail["trip"];

const CANCELLED_BY = {
  rider: "the rider",
  driver: "the driver",
  system: "Jamogo",
} as const;

/** What happened, in order: requested, driver found, arrived, picked up, finished or cancelled. */
function timelineOf(trip: FullTrip): TimelineStep[] {
  const accepted = trip.offers?.find(
    (o) => o.id === trip.acceptedDriverOfferId,
  );
  const steps: TimelineStep[] = [
    {
      label: "Ride requested",
      detail: `${trip.mode === "share" ? "Shared ride" : "Solo ride"} · rider offered ${cedis(trip.yourOffer)}`,
      at: trip.createdAt,
      icon: Search,
    },
    {
      label: accepted ? `${accepted.name} accepted` : "Driver accepted",
      detail: accepted
        ? `${accepted.car} · ${accepted.plate} · agreed ${cedis(accepted.price)}`
        : undefined,
      // An offer's last change is its acceptance.
      at: accepted ? (accepted.updatedAt ?? null) : null,
      tone: accepted ? "done" : "pending",
      icon: Car,
    },
    {
      label: "Arrived at pickup",
      at: trip.arrivedAt,
      detail:
        Number(trip.waitingFee) > 0
          ? `Waiting fee ${cedis(trip.waitingFee)}`
          : undefined,
      icon: MapPin,
    },
    { label: "Rider picked up", at: trip.pickedUpAt, icon: UserCheck },
  ];
  if (trip.status === "cancelled") {
    steps.push({
      label: trip.riderNoShow ? "Cancelled: rider didn't show up" : "Cancelled",
      detail: [
        trip.cancelledBy && `By ${CANCELLED_BY[trip.cancelledBy]}`,
        trip.cancelledReason,
      ]
        .filter(Boolean)
        .join(" · "),
      at: trip.cancelledAt,
      tone: "danger",
      icon: Ban,
    });
  } else {
    steps.push({
      label: "Trip completed",
      at: trip.completedAt,
      detail:
        trip.takings != null
          ? `Driver collected ${cedis(trip.takings)}`
          : undefined,
      icon: Flag,
    });
  }
  // Only show steps that happened, plus the next one still to come.
  const happened = (s: TimelineStep) =>
    s.tone === "done" || s.tone === "danger" || !!s.at;
  // A finished trip: what happened, then how it ended (skipped steps left out).
  if (trip.status === "completed" || trip.status === "cancelled") {
    return steps.filter((s, i) => happened(s) || i === steps.length - 1);
  }
  // Still going: what's happened so far, then the next step to come.
  const firstPending = steps.findIndex((s) => !happened(s));
  return firstPending === -1 ? steps : steps.slice(0, firstPending + 1);
}

export function TripPage({ id }: { id: string }) {
  const { data, isLoading, error } = useTripDetail(id);
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="space-y-4">
        <BackLink href="/trips" label="Trips" />
        <Nothing
          icon={Route}
          text={
            error instanceof ApiError && error.status === 404
              ? "This trip doesn't exist."
              : "Couldn't load this trip. Try refreshing."
          }
        />
      </div>
    );
  }
  return <TripBody data={data} />;
}

function TripBody({ data }: { data: TripDetail }) {
  const { trip } = data;
  const accepted = trip.offers?.find(
    (o) => o.id === trip.acceptedDriverOfferId,
  );
  const coRiders = trip.coRiders.filter((c) => c.status === "accepted");
  const commission = data.commissionEntries
    .filter((e) => e.type === "charge")
    .reduce((s, e) => s + Number(e.amount), 0);
  const finished = trip.status === "completed";

  return (
    <div className="space-y-6">
      <BackLink href="/trips" label="Trips" />

      <div className="relative overflow-hidden rounded-2xl border border-jamogo-gray-200 bg-card p-6 shadow-card">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-jamogo-green-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={TRIP_TONE[trip.status]}>{trip.status}</Badge>
              <Badge tone={trip.mode === "share" ? "success" : "neutral"}>
                {trip.mode === "share"
                  ? `Shared · ${coRiders.length + 1} bookings`
                  : "Solo"}
              </Badge>
              <CopyId id={trip.id} />
            </div>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex flex-col items-center pt-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-jamogo-green-500" />
                <span className="my-1 h-6 w-0.5 bg-jamogo-gray-200" />
                <span className="h-2.5 w-2.5 rounded-sm bg-jamogo-ink-900" />
              </div>
              <div className="min-w-0 space-y-3">
                <p className="font-heading text-lg leading-tight font-semibold text-jamogo-ink-900">
                  {trip.pickupLabel}
                </p>
                <p className="font-heading text-lg leading-tight font-semibold text-jamogo-ink-900">
                  {trip.destinationLabel || "No destination set"}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-jamogo-gray-500">
            <p>Requested {formatDate(trip.createdAt, true)}</p>
            {trip.distanceKm && (
              <p className="mt-0.5">{Number(trip.distanceKm).toFixed(1)} km</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatsCard
          label={finished ? "Driver collected" : "Fares so far"}
          value={cedis(trip.takings ?? trip.fareTotal)}
          icon={Wallet}
          hint={
            coRiders.length > 0
              ? `From ${coRiders.length + 1} bookings`
              : "From the rider"
          }
        />
        <StatsCard
          label="Rider pays"
          value={cedis(trip.finalFare ?? trip.liveFare)}
          icon={Users}
          hint={
            trip.soloFare > trip.liveFare
              ? `${cedis(trip.soloFare)} riding alone`
              : `Agreed ${cedis(accepted?.price ?? trip.yourOffer)}`
          }
        />
        <StatsCard
          label="Commission"
          value={cedis(commission)}
          icon={Percent}
          tone="info"
          hint={
            finished ? "Charged to the driver" : "Charged when the trip ends"
          }
        />
        <StatsCard
          label="Ratings"
          value={
            trip.riderRating || trip.driverRating
              ? `${trip.driverRating ?? "–"} / ${trip.riderRating ?? "–"}`
              : "Not rated"
          }
          icon={Star}
          tone="warning"
          hint="Driver / rider, out of 5"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Panel title="What happened">
            <Timeline steps={timelineOf(trip)} />
          </Panel>

          <Panel title="Stops" description="In the order the driver set">
            {trip.stops.length === 0 ? (
              <Nothing icon={MapPin} text="No stops." />
            ) : (
              <ol className="divide-y divide-jamogo-gray-100">
                {trip.stops.map((s) => (
                  <li
                    key={s.key}
                    className="flex items-center gap-3 py-3 text-sm"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        s.type === "pickup"
                          ? "bg-jamogo-green-100 text-jamogo-green-600"
                          : "bg-jamogo-gray-100 text-jamogo-ink-900"
                      }`}
                    >
                      {s.type === "pickup" ? (
                        <Navigation size={15} />
                      ) : (
                        <Flag size={15} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-jamogo-ink-900">
                        {s.type === "pickup" ? "Pick up" : "Drop off"} {s.name}
                      </span>
                      <span className="block truncate text-xs text-jamogo-gray-500">
                        {s.label || "—"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-medium text-jamogo-ink-900">
                        {cedis(s.fare)}
                      </span>
                      <span className="block text-xs text-jamogo-gray-500">
                        {s.skipped
                          ? "No-show"
                          : s.done
                            ? `Done ${formatTime(s.doneAt)}`
                            : "Not yet"}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel
            title="Driver offers"
            description={`${trip.offers?.length ?? 0} driver${trip.offers?.length === 1 ? "" : "s"} answered`}
          >
            {!trip.offers?.length ? (
              <Nothing icon={Car} text="No driver offered on this trip." />
            ) : (
              <div className="divide-y divide-jamogo-gray-100">
                {trip.offers.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center gap-3 py-3 text-sm"
                  >
                    <PersonAvatar
                      name={o.name}
                      url={o.driver?.avatarUrl}
                      size={36}
                    />
                    <span className="min-w-0 flex-1">
                      {o.driverId ? (
                        <Link
                          href={`/drivers/${o.driverId}`}
                          className="block truncate font-medium text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
                        >
                          {o.name}
                        </Link>
                      ) : (
                        <span className="block truncate font-medium text-jamogo-ink-900">
                          {o.name}
                        </span>
                      )}
                      <span className="block truncate text-xs text-jamogo-gray-500">
                        {o.car} · {o.plate}
                      </span>
                    </span>
                    <span className="font-medium text-jamogo-ink-900">
                      {cedis(o.price)}
                    </span>
                    <Badge
                      tone={
                        o.state === "accepted"
                          ? "success"
                          : o.state === "declined"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {o.state}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="People">
            <div className="space-y-1">
              {trip.rider && (
                <PersonLink
                  href={`/users/${trip.riderId}`}
                  name={trip.rider.name}
                  avatar={trip.rider.avatarUrl}
                  role={
                    trip.partySize > 1
                      ? `Booked the ride · +${trip.partySize - 1}`
                      : "Booked the ride"
                  }
                  amount={trip.finalFare ?? trip.liveFare}
                />
              )}
              {accepted && (
                <PersonLink
                  href={
                    accepted.driverId
                      ? `/drivers/${accepted.driverId}`
                      : undefined
                  }
                  name={accepted.name}
                  avatar={accepted.driver?.avatarUrl}
                  role={`Driver · ${accepted.car}`}
                />
              )}
              {coRiders.map((c) => (
                <PersonLink
                  key={c.id}
                  href={c.riderId ? `/users/${c.riderId}` : undefined}
                  name={c.name}
                  avatar={c.rider?.avatarUrl}
                  role={
                    c.noShowAt
                      ? "Co-rider · didn't show up"
                      : `Co-rider · ${c.joinLabel} → ${c.dropoffLabel || "…"}`
                  }
                  amount={c.noShowAt ? 0 : c.finalFare}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Payment">
            <div className="divide-y divide-jamogo-gray-100">
              <InfoRow label="Rider offered">{cedis(trip.yourOffer)}</InfoRow>
              {accepted && (
                <InfoRow label="Agreed with driver">
                  {cedis(accepted.price)}
                </InfoRow>
              )}
              {Number(trip.waitingFee) > 0 && (
                <InfoRow label="Waiting fee">{cedis(trip.waitingFee)}</InfoRow>
              )}
              <InfoRow label="Paid">Cash or MoMo to the driver</InfoRow>
              {data.commissionEntries.map((e) => (
                <InfoRow key={e.id} label="Commission">
                  {cedis(e.amount)}
                  {e.rate ? ` (${Math.round(Number(e.rate) * 100)}%)` : ""}
                </InfoRow>
              ))}
            </div>
          </Panel>

          <Panel title="Safety and messages">
            <div className="space-y-2 text-sm">
              {data.sosAlerts.length === 0 ? (
                <p className="flex items-center gap-2 text-jamogo-gray-500">
                  <CheckCircle2 size={16} className="text-jamogo-green-600" />{" "}
                  No SOS alerts
                </p>
              ) : (
                data.sosAlerts.map((a) => (
                  <p
                    key={a.id}
                    className="flex items-start gap-2 rounded-lg bg-jamogo-danger/10 px-3 py-2 text-jamogo-danger"
                  >
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    SOS from {a.user?.name ?? "someone"} at{" "}
                    {formatDate(a.createdAt, true)}
                  </p>
                ))
              )}
              <p className="flex items-center gap-2 text-jamogo-gray-500">
                <MessageSquare size={16} /> {data.messageCount} chat message
                {data.messageCount === 1 ? "" : "s"}
              </p>
              {trip.status !== "completed" && trip.status !== "cancelled" && (
                <p className="flex items-center gap-2 text-jamogo-gray-500">
                  <Clock size={16} /> In progress
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-jamogo-gray-200 bg-card px-6 py-5 shadow-card">
      <div className="mb-3">
        <h3 className="font-heading text-base font-semibold text-jamogo-ink-900">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-jamogo-gray-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function PersonLink({
  href,
  name,
  avatar,
  role,
  amount,
}: {
  href?: string;
  name: string;
  avatar?: string | null;
  role: string;
  amount?: number;
}) {
  const body = (
    <>
      <PersonAvatar name={name} url={avatar} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-jamogo-ink-900">
          {name}
        </span>
        <span className="block truncate text-xs text-jamogo-gray-500">
          {role}
        </span>
      </span>
      {amount !== undefined && (
        <span className="shrink-0 text-sm font-semibold text-jamogo-ink-900">
          {cedis(amount)}
        </span>
      )}
    </>
  );
  return href ? (
    <Link
      href={href}
      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-jamogo-gray-50"
    >
      {body}
    </Link>
  ) : (
    <div className="-mx-2 flex items-center gap-3 px-2 py-2">{body}</div>
  );
}
