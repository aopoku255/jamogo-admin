"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import {
  EditCommissionDialog,
  WaiveDialog,
} from "@/components/commission/CommissionDialogs";
import { useSetDriverCommission } from "@/hooks/useDrivers";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import type { AdminUser, CommissionEntry } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * The driver's commission: on/off switch (off by default — no commission is
 * recorded while off), rate, what they owe vs their limit, and the latest
 * ledger entries. Edit rate/limit or clear what's owed from here.
 */
export function CommissionPanel({
  user,
  entries,
}: {
  user: AdminUser;
  entries: CommissionEntry[];
}) {
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
  const driver = {
    userId: user.id,
    name: user.name,
    commissionRate: rate,
    commissionLimit: limit,
    commissionOwed: owed,
  };

  function toggle(on: boolean) {
    setCommission.mutate(
      { userId: user.id, commissionEnabled: on },
      {
        onSuccess: () =>
          toast.success(
            on ? "Commission switched on." : "Commission switched off.",
          ),
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
          <Badge tone={profile.commissionEnabled ? "success" : "neutral"}>
            {profile.commissionEnabled ? "On" : "Off"}
          </Badge>
        )}
      </div>
      {(profile.commissionEnabled || owed > 0) && (
        <div className="mt-3 flex items-center justify-between border-t border-jamogo-gray-100 pt-3">
          <p>
            <span
              className={`font-semibold ${blocked ? "text-jamogo-danger" : "text-jamogo-ink-900"}`}
            >
              GH₵{owed.toFixed(2)} owed
            </span>
            {blocked && (
              <span className="ml-2">
                <Badge tone="danger">Can&apos;t accept rides</Badge>
              </span>
            )}
          </p>
          {canManage && (
            <span className="space-x-3">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="font-medium text-jamogo-green-600 hover:underline"
              >
                Edit rate & limit
              </button>
              {owed > 0 && (
                <button
                  type="button"
                  onClick={() => setWaiving(true)}
                  className="font-medium text-jamogo-gray-700 hover:underline"
                >
                  Clear…
                </button>
              )}
            </span>
          )}
        </div>
      )}
      {entries.length > 0 && (
        <div className="mt-3 border-t border-jamogo-gray-100 pt-2">
          {entries.slice(0, 20).map((e) => (
            <div
              key={e.id}
              className="flex justify-between py-1 text-jamogo-gray-700"
            >
              <span>
                {e.type === "charge"
                  ? "Trip commission"
                  : e.type === "payment"
                    ? "MoMo payment"
                    : "Cleared by admin"}
                <span className="text-jamogo-gray-500">
                  {" "}
                  · {formatDate(e.createdAt)}
                  {e.status !== "completed" ? ` · ${e.status}` : ""}
                </span>
              </span>
              <span
                className={e.type === "charge" ? "" : "text-jamogo-green-600"}
              >
                {e.type === "charge" ? "+" : "−"}GH₵
                {Number(e.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
      <EditCommissionDialog
        driver={editing ? driver : null}
        onClose={() => setEditing(false)}
      />
      <WaiveDialog
        driver={waiving ? driver : null}
        onClose={() => setWaiving(false)}
      />
    </div>
  );
}
