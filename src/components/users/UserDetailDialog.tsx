"use client";

// No longer used: people open on their own page (app/users/[id], app/drivers/[id]). Safe to delete.

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { EditCommissionDialog, WaiveDialog } from "@/components/commission/CommissionDialogs";
import { useUserDetail, useSuspendUser, useUnsuspendUser } from "@/hooks/useUsers";
import { useSetDriverCommission } from "@/hooks/useDrivers";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import type { AdminUser, CommissionEntry, Trip, UserDetail as UserDetailData } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TripRow({ trip, perspective }: { trip: Trip; perspective: "rider" | "driver" }) {
  const other = perspective === "rider" ? trip.acceptedOffer?.name : trip.rider?.name;
  return (
    <div className="flex items-center justify-between border-b border-jamogo-gray-100 py-2.5 text-sm last:border-0">
      <div>
        <p className="font-medium text-jamogo-ink-900">
          {trip.pickupLabel} → {trip.destinationLabel || "—"}
        </p>
        <p className="text-jamogo-gray-500">
          {formatDate(trip.createdAt)}
          {other ? ` · ${perspective === "rider" ? "Driver" : "Rider"}: ${other}` : ""}
        </p>
      </div>
      <Badge
        tone={trip.status === "completed" ? "success" : trip.status === "cancelled" ? "danger" : "info"}
      >
        {trip.status}
      </Badge>
    </div>
  );
}

/**
 * The driver's commission: on/off switch (off by default — no commission is
 * recorded while off), rate, what they owe vs their limit, and the latest
 * ledger entries. Edit rate/limit or clear what's owed from here.
 */
function CommissionSection({ user, entries }: { user: AdminUser; entries: CommissionEntry[] }) {
  const profile = user.driverProfile!;
  const { hasPermission } = useCurrentAdmin();
  const canManage = hasPermission("drivers.manage");
  const setCommission = useSetDriverCommission();
  const [editing, setEditing] = useState(false);
  const [waiving, setWaiving] = useState(false);
  const owed = Number(profile.commissionOwed ?? 0);
  const limit = Number(profile.commissionLimit ?? 0);
  const rate = Number(profile.commissionRate);
  const blocked = profile.commissionEnabled && owed > limit;
  const driver = { userId: user.id, name: user.name, commissionRate: rate, commissionLimit: limit, commissionOwed: owed };

  function toggle(on: boolean) {
    setCommission.mutate(
      { userId: user.id, commissionEnabled: on },
      {
        onSuccess: () => toast.success(on ? "Commission switched on." : "Commission switched off."),
        onError: () => toast.error("Couldn't change that. Try again."),
      },
    );
  }

  return (
    <div className="rounded-xl border border-jamogo-gray-200 p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-jamogo-ink-900">Charge commission</p>
          <p className="text-jamogo-gray-500">
            {profile.commissionEnabled
              ? `${Math.round(rate * 100)}% of each trip · limit GH₵${limit.toFixed(2)}`
              : "Off. This driver keeps every fare"}
          </p>
        </div>
        {canManage ? (
          <Switch checked={profile.commissionEnabled} onChange={toggle} />
        ) : (
          <Badge tone={profile.commissionEnabled ? "success" : "neutral"}>{profile.commissionEnabled ? "On" : "Off"}</Badge>
        )}
      </div>
      {(profile.commissionEnabled || owed > 0) && (
        <div className="mt-3 flex items-center justify-between border-t border-jamogo-gray-100 pt-3">
          <p>
            <span className={`font-semibold ${blocked ? "text-jamogo-danger" : "text-jamogo-ink-900"}`}>
              GH₵{owed.toFixed(2)} owed
            </span>
            {blocked && <span className="ml-2"><Badge tone="danger">Can&apos;t accept rides</Badge></span>}
          </p>
          {canManage && (
            <span className="space-x-3">
              <button type="button" onClick={() => setEditing(true)} className="font-medium text-jamogo-green-600 hover:underline">
                Edit rate & limit
              </button>
              {owed > 0 && (
                <button type="button" onClick={() => setWaiving(true)} className="font-medium text-jamogo-gray-700 hover:underline">
                  Clear…
                </button>
              )}
            </span>
          )}
        </div>
      )}
      {entries.length > 0 && (
        <div className="mt-3 border-t border-jamogo-gray-100 pt-2">
          {entries.slice(0, 6).map((e) => (
            <div key={e.id} className="flex justify-between py-1 text-jamogo-gray-700">
              <span>
                {e.type === "charge" ? "Trip commission" : e.type === "payment" ? "MoMo payment" : "Cleared by admin"}
                <span className="text-jamogo-gray-500"> · {formatDate(e.createdAt)}{e.status !== "completed" ? ` · ${e.status}` : ""}</span>
              </span>
              <span className={e.type === "charge" ? "" : "text-jamogo-green-600"}>
                {e.type === "charge" ? "+" : "−"}GH₵{Number(e.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
      <EditCommissionDialog driver={editing ? driver : null} onClose={() => setEditing(false)} />
      <WaiveDialog driver={waiving ? driver : null} onClose={() => setWaiving(false)} />
    </div>
  );
}

function UserDetailBody({ user, data }: { user: AdminUser; data: UserDetailData }) {
  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handleSuspend() {
    suspend.mutate(
      { id: user.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`${user.name} was suspended.`);
          setReasonOpen(false);
          setReason("");
        },
        onError: () => toast.error("Couldn't suspend this account. Try again."),
      },
    );
  }

  function handleUnsuspend() {
    unsuspend.mutate(user.id, {
      onSuccess: () => toast.success(`${user.name}'s suspension was lifted.`),
      onError: () => toast.error("Couldn't lift the suspension. Try again."),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-jamogo-gray-500">
            {user.phone}
            {user.email ? ` · ${user.email}` : ""}
          </p>
          <p className="mt-1 text-sm text-jamogo-gray-500 capitalize">
            {user.role}
          </p>
        </div>
        {user.isSuspended ? (
          <Badge tone="danger">Suspended</Badge>
        ) : (
          <Badge tone="success">Active</Badge>
        )}
      </div>

      {(user.noShowCount ?? 0) > 0 && (
        <p className="rounded-xl bg-jamogo-gray-100 p-3 text-sm text-jamogo-ink-900">
          No-shows: {user.noShowCount}: times a driver waited out the free time and this rider
          never came. Not charged; recorded here only.
        </p>
      )}

      {user.isSuspended && user.suspendedReason && (
        <p className="rounded-xl bg-jamogo-gray-100 p-3 text-sm text-jamogo-ink-900">
          Reason: {user.suspendedReason}
        </p>
      )}

      {user.driverProfile && (
        <div className="rounded-xl border border-jamogo-gray-200 p-3 text-sm">
          <p className="font-medium text-jamogo-ink-900">
            {[user.driverProfile.carMake, user.driverProfile.carModel].filter(Boolean).join(" ") ||
              "No vehicle on file"}
            {user.driverProfile.plateNumber ? ` · ${user.driverProfile.plateNumber}` : ""}
          </p>
          <p className="text-jamogo-gray-500">
            {user.driverProfile.isOnline ? "Online" : "Offline"} · Rating{" "}
            {user.driverProfile.rating} · {user.driverProfile.totalTrips} trips
          </p>
        </div>
      )}

      {user.driverProfile && <CommissionSection user={user} entries={data.commissionEntries ?? []} />}

      {data.riderTrips.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-jamogo-gray-500">
            Trips as rider
          </p>
          {data.riderTrips.map((trip) => (
            <TripRow key={trip.id} trip={trip} perspective="rider" />
          ))}
        </div>
      )}

      {data.driverTrips.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-jamogo-gray-500">
            Trips as driver
          </p>
          {data.driverTrips.map((trip) => (
            <TripRow key={trip.id} trip={trip} perspective="driver" />
          ))}
        </div>
      )}

      {data.riderTrips.length === 0 && data.driverTrips.length === 0 && (
        <p className="text-sm text-jamogo-gray-500">No trips yet.</p>
      )}

      {reasonOpen && (
        <div>
          <label className="text-sm font-medium text-jamogo-ink-900">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {user.isSuspended ? (
          <Button variant="primary" onClick={handleUnsuspend} disabled={unsuspend.isPending}>
            Lift suspension
          </Button>
        ) : reasonOpen ? (
          <Button variant="danger" onClick={handleSuspend} disabled={suspend.isPending}>
            Confirm suspend
          </Button>
        ) : (
          <Button variant="danger" onClick={() => setReasonOpen(true)}>
            Suspend account
          </Button>
        )}
      </div>
    </div>
  );
}

export function UserDetailDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useUserDetail(userId);

  return (
    <Dialog open={!!userId} onClose={onClose} title={data?.user.name ?? "User"}>
      {isLoading || !data ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <UserDetailBody user={data.user} data={data} />
      )}
    </Dialog>
  );
}
