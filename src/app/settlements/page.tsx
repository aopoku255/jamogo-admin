"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  HandCoins,
  Percent,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { RequirePermission } from "@/components/RequirePermission";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { StatsCard } from "@/components/ui/StatsCard";
import { Nothing, cedis } from "@/components/detail/parts";
import { fetchDriverReport, useSettlements } from "@/hooks/useInsights";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { monthLabel, monthToRange, shiftMonth } from "@/lib/dates";
import { downloadCsv } from "@/lib/csv";
import type { SettlementRow } from "@/lib/types";

const STATUS = {
  settled: { tone: "success", label: "Settled" },
  part_paid: { tone: "warning", label: "Part paid" },
  unpaid: { tone: "danger", label: "Unpaid" },
} as const;

type Filter = "all" | "owing" | "settled";

export default function SettlementsPage() {
  return (
    <RequirePermission permission="wallet.manage">
      <Settlements />
    </RequirePermission>
  );
}

function Settlements() {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [filter, setFilter] = useState<Filter>("all");
  const [making, setMaking] = useState<string | null>(null);
  const { data, isLoading, isFetching } = useSettlements(month);
  const { hasPermission } = useCurrentAdmin();
  const canReports = hasPermission("analytics.view");
  const t = data?.totals;
  const range = monthToRange(month);

  const rows = (data?.drivers ?? []).filter((d) =>
    filter === "all"
      ? true
      : filter === "settled"
        ? d.status === "settled"
        : d.status !== "settled",
  );

  async function statement(row: SettlementRow) {
    setMaking(row.driverId);
    try {
      const [report, { downloadDriverStatement }] = await Promise.all([
        fetchDriverReport(row.driverId, range),
        import("@/lib/pdf"),
      ]);
      await downloadDriverStatement(report);
    } catch {
      toast.error(`Couldn't make ${row.name}'s statement. Try again.`);
    } finally {
      setMaking(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-lg border border-jamogo-gray-200 bg-card shadow-card">
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-l-lg text-jamogo-gray-500 hover:bg-jamogo-gray-50 hover:text-jamogo-ink-900"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-36 px-2 text-center text-sm font-semibold text-jamogo-ink-900">
            {monthLabel(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={month >= thisMonth}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-r-lg text-jamogo-gray-500 hover:bg-jamogo-gray-50 hover:text-jamogo-ink-900 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <p className="text-sm text-jamogo-gray-500">
          {month === thisMonth ? "This month so far. " : ""}Riders pay drivers
          directly; this is the commission drivers owe Jamogo.
        </p>
      </div>

      <div
        className={`grid grid-cols-2 gap-3 transition-opacity sm:gap-4 xl:grid-cols-4 ${isFetching && !isLoading ? "opacity-60" : ""}`}
      >
        <StatsCard
          label="Commission charged"
          value={cedis(t?.charged)}
          icon={Percent}
          tone="info"
          hint={t ? `${t.drivers} drivers` : undefined}
          loading={isLoading}
        />
        <StatsCard
          label="Paid by MoMo"
          value={cedis(t?.paid)}
          icon={Wallet}
          hint="Completed payments"
          loading={isLoading}
        />
        <StatsCard
          label="Cleared by Jamogo"
          value={cedis(t?.waived)}
          icon={HandCoins}
          tone="neutral"
          hint="Waived by an admin"
          loading={isLoading}
        />
        <StatsCard
          label="Still owed"
          value={cedis(t?.outstanding)}
          icon={ReceiptText}
          tone={t && t.outstanding > 0 ? "warning" : "green"}
          hint={t ? `${t.settled} of ${t.drivers} drivers settled` : undefined}
          loading={isLoading}
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-jamogo-gray-200 bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "All drivers"],
                ["owing", "Still owing"],
                ["settled", "Settled"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === value
                    ? "bg-jamogo-green-500 text-white"
                    : "bg-jamogo-gray-100 text-jamogo-gray-700 hover:bg-jamogo-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {!!data?.drivers.length && (
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `jamogo-settlements-${month}.csv`,
                  [
                    "Driver",
                    "Phone",
                    "Plate",
                    "Trips",
                    "Fares (GHS)",
                    "Owed at start",
                    "Charged",
                    "Paid",
                    "Cleared",
                    "Owed at end",
                    "Status",
                  ],
                  data.drivers.map((d) => [
                    d.name,
                    d.phone,
                    d.plate,
                    d.trips,
                    d.fares,
                    d.opening,
                    d.charged,
                    d.paid,
                    d.waived,
                    d.closing,
                    STATUS[d.status].label,
                  ]),
                )
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-jamogo-gray-300 bg-card px-3 text-xs font-semibold text-jamogo-ink-900 transition-colors hover:bg-jamogo-gray-50"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <Nothing
            icon={CheckCircle2}
            text={
              filter === "owing"
                ? "Nobody owes commission for this month."
                : `No commission activity in ${monthLabel(month)}.`
            }
          />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-jamogo-gray-200 bg-jamogo-gray-50 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
                  <th className="px-5 py-2.5">Driver</th>
                  <th className="px-3 py-2.5 text-right">Trips</th>
                  <th className="px-3 py-2.5 text-right">Fares</th>
                  <th className="px-3 py-2.5 text-right">Owed at start</th>
                  <th className="px-3 py-2.5 text-right">Charged</th>
                  <th className="px-3 py-2.5 text-right">Paid</th>
                  <th className="px-3 py-2.5 text-right">Cleared</th>
                  <th className="px-3 py-2.5 text-right">Owed at end</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr
                    key={d.driverId}
                    className="border-b border-jamogo-gray-100 transition-colors last:border-0 hover:bg-jamogo-gray-50"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/drivers/${d.driverId}`}
                        className="font-medium text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
                      >
                        {d.name}
                      </Link>
                      <p className="text-xs text-jamogo-gray-500">
                        {[d.plate, d.phone].filter(Boolean).join(" · ")}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right text-jamogo-ink-900">
                      {d.trips}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap text-jamogo-ink-900">
                      {cedis(d.fares)}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap text-jamogo-gray-700">
                      {cedis(d.opening)}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap text-jamogo-ink-900">
                      {cedis(d.charged)}
                    </td>
                    <td
                      className={`px-3 py-3 text-right whitespace-nowrap ${d.paid ? "text-jamogo-green-600" : "text-jamogo-gray-400"}`}
                    >
                      {d.paid ? `−${cedis(d.paid)}` : "—"}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap text-jamogo-gray-700">
                      {d.waived ? `−${cedis(d.waived)}` : "—"}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold whitespace-nowrap text-jamogo-ink-900">
                      {cedis(d.closing)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS[d.status].tone}>
                        {STATUS[d.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        {canReports && (
                          <Link
                            href={`/insights/drivers/${d.driverId}?from=${range.from}&to=${range.to}`}
                            title="Report"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-jamogo-gray-500 transition-colors hover:bg-jamogo-gray-100 hover:text-jamogo-ink-900"
                          >
                            <BarChart3 size={16} />
                          </Link>
                        )}
                        {canReports && (
                          <button
                            type="button"
                            onClick={() => statement(d)}
                            disabled={making !== null}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-jamogo-gray-300 bg-card px-2.5 text-xs font-semibold whitespace-nowrap text-jamogo-ink-900 transition-colors hover:bg-jamogo-gray-50 disabled:opacity-50"
                          >
                            {making === d.driverId ? (
                              <Spinner className="h-3.5 w-3.5" />
                            ) : (
                              <FileText size={14} />
                            )}{" "}
                            Statement
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
