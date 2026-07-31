import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Trip } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_TONE = {
  planning: "neutral",
  searching: "info",
  matched: "info",
  ongoing: "warning",
  completed: "success",
  cancelled: "danger",
} as const;

export function TripsTable({
  trips,
  onView,
}: {
  trips: Trip[];
  onView: (trip: Trip) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 text-xs font-semibold uppercase text-jamogo-gray-500">
            <th className="px-5 py-3">Created</th>
            <th className="px-5 py-3">Rider</th>
            <th className="px-5 py-3">Route</th>
            <th className="px-5 py-3">Driver</th>
            <th className="px-5 py-3">Fare</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr key={trip.id} className="border-b border-jamogo-gray-100 last:border-0">
              <td className="px-5 py-4 text-jamogo-gray-500">{formatDate(trip.createdAt)}</td>
              <td className="px-5 py-4">
                <p className="font-medium text-jamogo-ink-900">{trip.rider?.name ?? "—"}</p>
                <p className="text-jamogo-gray-500">{trip.rider?.phone}</p>
              </td>
              <td className="max-w-xs truncate px-5 py-4 text-jamogo-ink-900">
                {trip.pickupLabel} → {trip.destinationLabel || "—"}
              </td>
              <td className="px-5 py-4 text-jamogo-ink-900">
                {trip.acceptedOffer?.name ?? "—"}
              </td>
              <td className="px-5 py-4 text-jamogo-ink-900">GH₵{trip.yourOffer}</td>
              <td className="px-5 py-4">
                <Badge tone={STATUS_TONE[trip.status]}>{trip.status}</Badge>
              </td>
              <td className="px-5 py-4 text-right">
                <Button variant="secondary" onClick={() => onView(trip)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
