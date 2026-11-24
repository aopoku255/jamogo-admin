"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { usePagination } from "@/hooks/usePagination";
import { ActivityLogsTable } from "@/components/activityLogs/ActivityLogsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { RequirePermission } from "@/components/RequirePermission";

export const ACTIONS = [
  { value: "", label: "All activity" },
  { value: "kyc.decide", label: "KYC decision" },
  { value: "driver_document.decide", label: "Driver document" },
  { value: "driver.approval", label: "Driver approval" },
  { value: "support_ticket.resolve", label: "Ticket resolved" },
  { value: "user.suspend", label: "User suspended" },
  { value: "user.unsuspend", label: "User unsuspended" },
  { value: "admin.create", label: "Admin created" },
  { value: "admin.update", label: "Admin updated" },
  { value: "admin.reset_password", label: "Password reset" },
  { value: "settings.update", label: "Settings changed" },
  { value: "notification.send", label: "Notification sent" },
];

export default function ActivityLogsPage() {
  return (
    <RequirePermission permission="logs.view">
      <ActivityLogsPageContent />
    </RequirePermission>
  );
}

function ActivityLogsPageContent() {
  const [action, setAction] = useState("");
  const { data: logs, isLoading, isError } = useActivityLogs(action || undefined);
  const pagination = usePagination(logs ?? []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-jamogo-gray-500">
          Filter
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              pagination.setPage(1);
            }}
            className="rounded-xl border border-jamogo-gray-300 bg-card px-3 py-2 text-sm font-medium text-jamogo-ink-900 outline-none focus:border-jamogo-green-500"
          >
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        {logs && (
          <p className="text-sm text-jamogo-gray-500">
            {logs.length} {logs.length === 1 ? "entry" : "entries"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          icon={History}
          title="Couldn't load activity logs"
          description="Something went wrong talking to the API. Try refreshing the page."
        />
      ) : !logs || logs.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" description="Nothing matches this filter right now." />
      ) : (
        <>
          <ActivityLogsTable logs={pagination.pageItems} />
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </>
      )}
    </div>
  );
}
