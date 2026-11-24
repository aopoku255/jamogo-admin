"use client";

// No longer used: trips open on their own page (app/trips/[id]). Safe to delete.

import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useTripDetail } from "@/hooks/useTrips";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TripDetailDialog({
  tripId,
  onClose,
}: {
  tripId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useTripDetail(tripId);
  const trip = data?.trip;

  return (
    <Dialog open={!!tripId} onClose={onClose} title="Trip detail">
      {isLoading || !trip ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-jamogo-ink-900">
                {trip.pickupLabel} → {trip.destinationLabel || "—"}
              </p>
              <p className="text-sm text-jamogo-gray-500">{formatDate(trip.createdAt)}</p>
            </div>
            <Badge
              tone={
                trip.status === "completed"
                  ? "success"
                  : trip.status === "cancelled"
                    ? "danger"
                    : "info"
              }
            >
              {trip.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-jamogo-gray-500">Rider</p>
              <p className="text-jamogo-ink-900">{trip.rider?.name ?? "—"}</p>
              <p className="text-jamogo-gray-500">{trip.rider?.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-jamogo-gray-500">Fare</p>
              <p className="text-jamogo-ink-900">
                GH₵{trip.yourOffer} · {trip.mode}
              </p>
              {trip.distanceKm && (
                <p className="text-jamogo-gray-500">{trip.distanceKm} km</p>
              )}
            </div>
          </div>

          {trip.offers && trip.offers.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-jamogo-gray-500">
                Driver offers
              </p>
              <div className="space-y-2">
                {trip.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between rounded-xl border border-jamogo-gray-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-jamogo-ink-900">{offer.name}</p>
                      <p className="text-jamogo-gray-500">
                        {offer.car} · {offer.plate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-jamogo-ink-900">GH₵{offer.price}</p>
                      <Badge
                        tone={
                          offer.state === "accepted"
                            ? "success"
                            : offer.state === "declined"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {offer.state}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trip.coRiders && trip.coRiders.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-jamogo-gray-500">
                Co-riders
              </p>
              <p className="text-sm text-jamogo-ink-900">{trip.coRiders.length} co-rider(s)</p>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
