import { Badge } from "@/components/ui/Badge";
import type { ActivityLog } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ACTION_LABELS: Record<string, string> = {
  "kyc.decide": "KYC decision",
  "driver_document.decide": "Driver document",
  "driver.approval": "Driver approval",
  "support_ticket.resolve": "Ticket resolved",
  "user.suspend": "User suspended",
  "user.unsuspend": "User unsuspended",
  "admin.create": "Admin created",
  "admin.update": "Admin updated",
  "admin.reset_password": "Password reset",
  "settings.update": "Settings changed",
  "notification.send": "Notification sent",
};

const ACTION_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  "kyc.decide": "info",
  "driver_document.decide": "info",
  "driver.approval": "info",
  "support_ticket.resolve": "success",
  "user.suspend": "danger",
  "user.unsuspend": "success",
  "admin.create": "success",
  "admin.update": "info",
  "admin.reset_password": "warning",
  "settings.update": "neutral",
  "notification.send": "info",
};

/** Renders {from, to, reason, ...} as a short readable line instead of raw JSON. */
function formatMetadata(metadata: ActivityLog["metadata"]) {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  if ("from" in metadata && "to" in metadata) {
    const { from, to, ...rest } = metadata;
    const restText = Object.entries(rest)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    return [`${String(from)} → ${String(to)}`, restText].filter(Boolean).join(" · ");
  }

  return Object.entries(metadata)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join(" · ");
}

export function ActivityLogsTable({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 text-xs font-semibold uppercase text-jamogo-gray-500">
            <th className="px-5 py-3">When</th>
            <th className="px-5 py-3">Admin</th>
            <th className="px-5 py-3">Action</th>
            <th className="px-5 py-3">Target</th>
            <th className="px-5 py-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-jamogo-gray-100 last:border-0">
              <td className="whitespace-nowrap px-5 py-4 text-jamogo-gray-500">
                {formatDate(log.createdAt)}
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-jamogo-ink-900">{log.admin.name}</p>
                <p className="text-jamogo-gray-500">{log.admin.username}</p>
              </td>
              <td className="px-5 py-4">
                <Badge tone={ACTION_TONE[log.action] ?? "neutral"}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </Badge>
              </td>
              <td className="px-5 py-4 text-jamogo-gray-500">
                {log.targetType ? (
                  <>
                    <span className="text-jamogo-ink-900">{log.targetType}</span>
                    {log.targetId && (
                      <span className="block truncate text-xs text-jamogo-gray-400" title={log.targetId}>
                        {log.targetId}
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="max-w-xs px-5 py-4 text-jamogo-gray-500">
                {formatMetadata(log.metadata) || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
