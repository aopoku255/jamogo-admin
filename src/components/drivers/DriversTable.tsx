import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { AdminUser } from "@/lib/types";

export function DriversTable({ drivers }: { drivers: AdminUser[] }) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 bg-jamogo-gray-50 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
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
            const vehicle = [profile?.carMake, profile?.carModel]
              .filter(Boolean)
              .join(" ");
            return (
              <tr
                key={driver.id}
                className="border-b border-jamogo-gray-100 transition-colors last:border-0 hover:bg-jamogo-gray-50"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/drivers/${driver.id}`}
                    className="font-medium text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
                  >
                    {driver.name}
                  </Link>
                  <p className="text-jamogo-gray-500">{driver.phone}</p>
                </td>
                <td className="px-5 py-3 text-jamogo-ink-900">
                  {vehicle || "—"}
                  {profile?.plateNumber ? ` · ${profile.plateNumber}` : ""}
                </td>
                <td className="px-5 py-3 text-jamogo-ink-900">
                  {profile
                    ? `${profile.rating} · ${profile.totalTrips} trips`
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={profile?.isOnline ? "success" : "neutral"}>
                    {profile?.isOnline ? "Online" : "Offline"}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  {driver.isSuspended ? (
                    <Badge tone="danger">Suspended</Badge>
                  ) : (
                    <Badge tone="success">Active</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/drivers/${driver.id}`}
                    className="inline-flex h-9 items-center rounded-lg border border-jamogo-gray-300 bg-card px-4 text-sm font-semibold text-jamogo-ink-900 shadow-sm transition-colors hover:bg-jamogo-gray-50"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
