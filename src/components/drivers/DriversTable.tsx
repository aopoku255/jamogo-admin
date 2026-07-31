import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/types";

export function DriversTable({
  drivers,
  onView,
}: {
  drivers: AdminUser[];
  onView: (driver: AdminUser) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 text-xs font-semibold uppercase text-jamogo-gray-500">
            <th className="px-5 py-3">Driver</th>
            <th className="px-5 py-3">Vehicle</th>
            <th className="px-5 py-3">Rating</th>
            <th className="px-5 py-3">Online</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => {
            const profile = driver.driverProfile;
            const vehicle = [profile?.carMake, profile?.carModel].filter(Boolean).join(" ");
            return (
              <tr key={driver.id} className="border-b border-jamogo-gray-100 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-jamogo-ink-900">{driver.name}</p>
                  <p className="text-jamogo-gray-500">{driver.phone}</p>
                </td>
                <td className="px-5 py-4 text-jamogo-ink-900">
                  {vehicle || "—"}
                  {profile?.plateNumber ? ` · ${profile.plateNumber}` : ""}
                </td>
                <td className="px-5 py-4 text-jamogo-ink-900">
                  {profile ? `${profile.rating} · ${profile.totalTrips} trips` : "—"}
                </td>
                <td className="px-5 py-4">
                  <Badge tone={profile?.isOnline ? "success" : "neutral"}>
                    {profile?.isOnline ? "Online" : "Offline"}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  {driver.isSuspended ? (
                    <Badge tone="danger">Suspended</Badge>
                  ) : (
                    <Badge tone="success">Active</Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="secondary" onClick={() => onView(driver)}>
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
