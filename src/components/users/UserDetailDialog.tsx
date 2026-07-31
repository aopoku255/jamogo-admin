"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useUserDetail, useSuspendUser, useUnsuspendUser } from "@/hooks/useUsers";
import type { AdminUser, Trip, UserDetail as UserDetailData } from "@/lib/types";

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
            {user.role} · Wallet GH₵{user.walletBalance}
          </p>
        </div>
        {user.isSuspended ? (
          <Badge tone="danger">Suspended</Badge>
        ) : (
          <Badge tone="success">Active</Badge>
        )}
      </div>

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
