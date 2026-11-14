"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSetDriverCommission, useWaiveCommission } from "@/hooks/useDrivers";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { CommissionDriver } from "@/lib/types";

const cedis = (n: number | string) => `GH₵${Number(n).toFixed(2)}`;

/** Rate and limit (the on/off switch is right in the table). Also used from the driver's details. */
export function EditCommissionDialog({
  driver,
  onClose,
}: {
  driver: Pick<CommissionDriver, "userId" | "name" | "commissionRate" | "commissionLimit"> | null;
  onClose: () => void;
}) {
  const setCommission = useSetDriverCommission();
  const [rate, setRate] = useState("");
  const [limit, setLimit] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  if (driver && loadedFor !== driver.userId) {
    setLoadedFor(driver.userId);
    setRate(String(Math.round(driver.commissionRate * 100)));
    setLimit(String(driver.commissionLimit));
  }

  function save() {
    if (!driver) return;
    const pct = Number(rate);
    const lim = Number(limit);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return toast.error("Rate must be between 0 and 100%.");
    if (!Number.isFinite(lim) || lim < 0) return toast.error("Limit must be GH₵0 or more.");
    setCommission.mutate(
      { userId: driver.userId, commissionRate: pct / 100, commissionLimit: lim },
      {
        onSuccess: () => {
          toast.success(`Saved ${driver.name}'s commission settings.`);
          setLoadedFor(null);
          onClose();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't save. Try again."),
      },
    );
  }

  return (
    <Dialog
      open={!!driver}
      onClose={() => {
        setLoadedFor(null);
        onClose();
      }}
      title={driver ? `Commission · ${driver.name}` : "Commission"}
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-jamogo-ink-900">Rate (% of each trip&apos;s fare)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-jamogo-ink-900">Limit (GH₵ unpaid before they can&apos;t accept rides)</span>
          <input
            type="number"
            min={0}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
          />
          <span className="mt-1 block text-xs text-jamogo-gray-500">Set 0 to require payment after every trip.</span>
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={setCommission.isPending}>
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/** Clears some or all of what a driver owes — e.g. they paid in cash at the office. */
export function WaiveDialog({
  driver,
  onClose,
}: {
  driver: Pick<CommissionDriver, "userId" | "name" | "commissionOwed"> | null;
  onClose: () => void;
}) {
  const waive = useWaiveCommission();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    if (!driver) return;
    const value = amount.trim() === "" ? undefined : Number(amount);
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) return toast.error("Enter an amount, or leave it empty for all of it.");
    waive.mutate(
      { userId: driver.userId, amount: value, note: note.trim() || undefined },
      {
        onSuccess: (res) => {
          toast.success(`Cleared. ${driver.name} now owes ${cedis(res.owed)}.`);
          setAmount("");
          setNote("");
          onClose();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't clear it. Try again."),
      },
    );
  }

  return (
    <Dialog open={!!driver} onClose={onClose} title={driver ? `Clear commission · ${driver.name}` : "Clear commission"}>
      {driver && (
        <div className="space-y-4">
          <p className="text-sm text-jamogo-gray-700">
            {driver.name} owes <b>{cedis(driver.commissionOwed)}</b>. Clear it when they&apos;ve paid another way (e.g. cash
            at the office), or as a goodwill write-off. This is recorded in the ledger.
          </p>
          <label className="block">
            <span className="text-sm font-medium text-jamogo-ink-900">Amount (GH₵)</span>
            <input
              type="number"
              min={0}
              placeholder={`All of it (${Number(driver.commissionOwed).toFixed(2)})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-jamogo-ink-900">Note</span>
            <input
              value={note}
              placeholder="e.g. Paid cash at Adum office"
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={waive.isPending}>
              Clear commission
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
