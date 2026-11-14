"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Percent } from "lucide-react";
import { useCommissionDrivers, useCommissionEntries, type CommissionDriverFilter } from "@/hooks/useCommission";
import { useSetDriverCommission } from "@/hooks/useDrivers";
import { useServerPagination } from "@/hooks/useServerPagination";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { RequirePermission } from "@/components/RequirePermission";
import { EditCommissionDialog, WaiveDialog } from "@/components/commission/CommissionDialogs";
import type { CommissionDriver, CommissionEntry } from "@/lib/types";

/**
 * Driver commission (replaces Wallet & Payouts). Jamogo holds no customer
 * money: riders pay drivers directly, and drivers with commission switched
 * on owe Jamogo a share of each completed trip, paid by MoMo through
 * Paystack. Over their limit they can't accept rides until they pay.
 * Commission is switched on per driver (here or in the driver's details).
 */

const cedis = (n: number | string) => `GH₵${Number(n).toFixed(2)}`;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CommissionPage() {
  return (
    <RequirePermission permission="wallet.manage">
      <CommissionPageContent />
    </RequirePermission>
  );
}

function CommissionPageContent() {
  const [tab, setTab] = useState<"drivers" | "ledger">("drivers");

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-jamogo-gray-500">
        Riders pay drivers directly in cash or MoMo — Jamogo holds no customer funds. Commission is off for every
        driver until you switch it on. Each completed trip then adds the driver&apos;s rate × fare to what they owe;
        once that passes their limit they can&apos;t accept rides until they pay by MoMo.
      </p>
      <div className="flex w-fit gap-1 rounded-xl bg-jamogo-gray-100 p-1 text-sm font-medium">
        {(["drivers", "ledger"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 capitalize transition-colors ${
              tab === t ? "bg-white text-jamogo-ink-900 shadow-sm" : "text-jamogo-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "drivers" ? <DriversTab /> : <LedgerTab />}
    </div>
  );
}

function DriversTab() {
  const [status, setStatus] = useState<CommissionDriverFilter>("all");
  const pagination = useServerPagination(15);
  const { data, isLoading, isError } = useCommissionDrivers(status, pagination);
  const { hasPermission } = useCurrentAdmin();
  const canManage = hasPermission("drivers.manage");
  const setCommission = useSetDriverCommission();
  const [editing, setEditing] = useState<CommissionDriver | null>(null);
  const [waiving, setWaiving] = useState<CommissionDriver | null>(null);
  const drivers = data?.drivers ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

  function toggle(d: CommissionDriver, on: boolean) {
    setCommission.mutate(
      { userId: d.userId, commissionEnabled: on },
      {
        onSuccess: () => toast.success(`Commission ${on ? "switched on" : "switched off"} for ${d.name}.`),
        onError: () => toast.error("Couldn't change that. Try again."),
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-jamogo-gray-200 p-4">
          <p className="text-sm text-jamogo-gray-500">Owed by drivers now</p>
          <p className="mt-1 text-2xl font-semibold text-jamogo-ink-900">{cedis(data?.totals.owed ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-jamogo-gray-200 p-4">
          <p className="text-sm text-jamogo-gray-500">Paid by MoMo (all time)</p>
          <p className="mt-1 text-2xl font-semibold text-jamogo-green-600">{cedis(data?.totals.paid ?? 0)}</p>
        </div>
      </div>

      <div className="flex gap-2 text-sm">
        {(
          [
            ["all", "All"],
            ["owing", "Owing"],
            ["blocked", "Blocked"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatus(value);
              pagination.setPage(1);
            }}
            className={`rounded-full border px-3 py-1 ${
              status === value
                ? "border-jamogo-green-500 bg-jamogo-green-50 text-jamogo-green-600"
                : "border-jamogo-gray-300 text-jamogo-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState icon={Percent} title="Couldn't load commission" description="Try refreshing the page." />
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="No drivers here"
          description="Switch commission on for a driver from their details (Drivers → open a driver)."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-jamogo-gray-50 text-left text-xs font-semibold uppercase text-jamogo-gray-500">
                <tr>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Owed / limit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-jamogo-gray-100">
                {drivers.map((d) => {
                  const pct = d.commissionLimit > 0 ? Math.min(1, d.commissionOwed / d.commissionLimit) : d.commissionOwed > 0 ? 1 : 0;
                  return (
                    <tr key={d.userId}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-jamogo-ink-900">{d.name}</p>
                        <p className="text-jamogo-gray-500">
                          {d.phone} · {d.totalTrips} trips
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {canManage ? (
                          <Switch checked={d.commissionEnabled} onChange={(on) => toggle(d, on)} />
                        ) : d.commissionEnabled ? (
                          "On"
                        ) : (
                          "Off"
                        )}
                      </td>
                      <td className="px-4 py-3 text-jamogo-gray-700">{Math.round(d.commissionRate * 100)}%</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-jamogo-ink-900">
                          {cedis(d.commissionOwed)} <span className="text-jamogo-gray-500">/ {cedis(d.commissionLimit)}</span>
                        </p>
                        <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-jamogo-gray-100">
                          <div
                            className={`h-full rounded-full ${d.blocked ? "bg-jamogo-danger" : pct >= 0.8 ? "bg-amber-400" : "bg-jamogo-green-500"}`}
                            style={{ width: `${pct * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {d.blocked ? (
                          <Badge tone="danger">Blocked</Badge>
                        ) : d.commissionEnabled ? (
                          <Badge tone="success">Can drive</Badge>
                        ) : (
                          <Badge tone="neutral">Off</Badge>
                        )}
                      </td>
                      <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => setEditing(d)}
                            className="font-medium text-jamogo-green-600 hover:underline"
                          >
                            Edit
                          </button>
                        )}
                        {canManage && d.commissionOwed > 0 && (
                          <button
                            type="button"
                            onClick={() => setWaiving(d)}
                            className="font-medium text-jamogo-gray-700 hover:underline"
                          >
                            Clear…
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.page}
            pageCount={pageCount}
            total={total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </>
      )}

      <EditCommissionDialog driver={editing} onClose={() => setEditing(null)} />
      <WaiveDialog driver={waiving} onClose={() => setWaiving(null)} />
    </div>
  );
}

function LedgerTab() {
  const [type, setType] = useState<CommissionEntry["type"] | "">("");
  const pagination = useServerPagination(15);
  const { data, isLoading, isError } = useCommissionEntries(type, pagination);
  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

  return (
    <div className="space-y-4">
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value as CommissionEntry["type"] | "");
          pagination.setPage(1);
        }}
        className="rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Everything</option>
        <option value="charge">Trip commission</option>
        <option value="payment">MoMo payments</option>
        <option value="waiver">Cleared by admin</option>
      </select>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState icon={Percent} title="Couldn't load the ledger" description="Try refreshing the page." />
      ) : entries.length === 0 ? (
        <EmptyState icon={Percent} title="Nothing yet" description="Entries appear once commission is on for a driver." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-jamogo-gray-50 text-left text-xs font-semibold uppercase text-jamogo-gray-500">
                <tr>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">What</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jamogo-gray-100">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-jamogo-ink-900">{e.driver?.name ?? "—"}</p>
                      <p className="text-jamogo-gray-500">{e.driver?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-jamogo-gray-700">
                      {e.type === "charge"
                        ? `Trip commission (${Math.round(Number(e.rate) * 100)}% of ${cedis(e.fare ?? 0)})`
                        : e.type === "payment"
                          ? `MoMo payment${e.provider ? ` · ${e.provider}` : ""}${e.phone ? ` · ${e.phone}` : ""}`
                          : `Cleared by admin${e.note ? ` · ${e.note}` : ""}`}
                    </td>
                    <td className={`px-4 py-3 font-medium ${e.type === "charge" ? "text-jamogo-ink-900" : "text-jamogo-green-600"}`}>
                      {e.type === "charge" ? "+" : "−"}
                      {cedis(e.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={e.status === "completed" ? "success" : e.status === "failed" ? "danger" : "warning"}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-jamogo-gray-500">{formatDateTime(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagination.page}
            pageCount={pageCount}
            total={total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </>
      )}
    </div>
  );
}
