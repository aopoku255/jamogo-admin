"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Wallet as WalletIcon } from "lucide-react";
import { useWalletTransactions, usePayouts, useResolvePayout } from "@/hooks/useWallet";
import { useServerPagination } from "@/hooks/useServerPagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { RequirePermission } from "@/components/RequirePermission";
import type { Payout, PayoutStatus } from "@/lib/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusTone(status: string): "success" | "danger" | "warning" | "neutral" {
  if (status === "paid" || status === "completed") return "success";
  if (status === "failed") return "danger";
  if (status === "pending" || status === "processing") return "warning";
  return "neutral";
}

export default function WalletPage() {
  return (
    <RequirePermission permission="wallet.manage">
      <WalletPageContent />
    </RequirePermission>
  );
}

function WalletPageContent() {
  const [tab, setTab] = useState<"payouts" | "transactions">("payouts");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-jamogo-gray-100 p-1 text-sm font-medium w-fit">
        {(["payouts", "transactions"] as const).map((t) => (
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

      {tab === "payouts" ? <PayoutsTab /> : <TransactionsTab />}
    </div>
  );
}

function PayoutsTab() {
  const [status, setStatus] = useState<PayoutStatus | "">("");
  const pagination = useServerPagination(15);
  const { data, isLoading, isError } = usePayouts(status, pagination);
  const [resolving, setResolving] = useState<Payout | null>(null);
  const payouts = data?.payouts ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

  return (
    <div className="space-y-4">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as PayoutStatus | "");
          pagination.setPage(1);
        }}
        className="rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
      </select>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          icon={WalletIcon}
          title="Couldn't load payouts"
          description="Something went wrong talking to the API. Try refreshing the page."
        />
      ) : payouts.length === 0 ? (
        <EmptyState icon={WalletIcon} title="No payouts found" description="Nothing matches this filter." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-jamogo-gray-50 text-left text-xs font-semibold uppercase text-jamogo-gray-500">
                <tr>
                  <th className="px-4 py-3">Driver/Rider</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-jamogo-gray-100">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-jamogo-ink-900">{p.user.name}</p>
                      <p className="text-jamogo-gray-500">{p.user.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-jamogo-ink-900">GH₵{p.amount}</td>
                    <td className="px-4 py-3 capitalize text-jamogo-gray-700">{p.channel}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                      {p.status === "failed" && p.failureReason && (
                        <p className="mt-1 text-xs text-jamogo-gray-500">{p.failureReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-jamogo-gray-500">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {["pending", "processing"].includes(p.status) && (
                        <button
                          type="button"
                          onClick={() => setResolving(p)}
                          className="font-medium text-jamogo-green-600 hover:underline"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
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

      <ResolvePayoutDialog payout={resolving} onClose={() => setResolving(null)} />
    </div>
  );
}

function ResolvePayoutDialog({ payout, onClose }: { payout: Payout | null; onClose: () => void }) {
  const resolve = useResolvePayout();
  const [reason, setReason] = useState("");
  const [providerReference, setProviderReference] = useState("");

  function handleResolve(decision: "paid" | "failed") {
    if (!payout) return;
    resolve.mutate(
      { id: payout.id, decision, reason: reason.trim() || undefined, providerReference: providerReference.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(decision === "paid" ? "Payout marked paid." : "Payout marked failed.");
          setReason("");
          setProviderReference("");
          onClose();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't resolve this payout."),
      },
    );
  }

  return (
    <Dialog open={!!payout} onClose={onClose} title="Resolve payout">
      {payout && (
        <div className="space-y-4">
          <p className="text-sm text-jamogo-gray-600">
            GH₵{payout.amount} to {payout.user.name} via {payout.channel}. Marking this <b>paid</b> debits
            their wallet now — only do this once the transfer has actually been sent.
          </p>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-jamogo-gray-500">
              Provider reference (optional)
            </label>
            <input
              value={providerReference}
              onChange={(e) => setProviderReference(e.target.value)}
              placeholder="e.g. MoMo transaction ID"
              className="w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-jamogo-gray-500">
              Note (optional, shown if marked failed)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="danger" onClick={() => handleResolve("failed")} disabled={resolve.isPending}>
              Mark failed
            </Button>
            <Button onClick={() => handleResolve("paid")} disabled={resolve.isPending}>
              Mark paid
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function TransactionsTab() {
  const pagination = useServerPagination(15);
  const { data, isLoading, isError } = useWalletTransactions(pagination);
  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          icon={WalletIcon}
          title="Couldn't load transactions"
          description="Something went wrong talking to the API. Try refreshing the page."
        />
      ) : transactions.length === 0 ? (
        <EmptyState icon={WalletIcon} title="No transactions yet" description="" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-jamogo-gray-50 text-left text-xs font-semibold uppercase text-jamogo-gray-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Balance after</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jamogo-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-jamogo-ink-900">{t.user.name}</p>
                      <p className="text-jamogo-gray-500">{t.user.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-jamogo-gray-700">{t.description}</td>
                    <td className="px-4 py-3 capitalize text-jamogo-gray-500">
                      {t.category?.replace("_", " ") ?? "—"}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        t.type === "credit" ? "text-jamogo-green-600" : "text-jamogo-ink-900"
                      }`}
                    >
                      {t.type === "credit" ? "+" : "−"}GH₵{t.amount}
                    </td>
                    <td className="px-4 py-3 text-jamogo-gray-500">
                      {t.balanceAfter != null ? `GH₵${t.balanceAfter}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-jamogo-gray-500">{formatDateTime(t.createdAt)}</td>
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
