"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Bell, Car, Search, Send, User, Users, X, type LucideIcon } from "lucide-react";
import { useNotificationAudience, useSendNotification } from "@/hooks/useNotifications";
import { useUsers } from "@/hooks/useUsers";
import { useDrivers } from "@/hooks/useDrivers";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { RequirePermission } from "@/components/RequirePermission";
import type {
  AdminUser,
  NotificationAudience,
  NotificationAudienceStats,
  SendNotificationResult,
} from "@/lib/types";

// Mirrors the backend limits in notification.controller.js.
const MAX_TITLE = 100;
const MAX_BODY = 500;

export default function NotificationsPage() {
  return (
    <RequirePermission permission="notifications.send">
      <NotificationsPageContent />
    </RequirePermission>
  );
}

function reachFor(audience: NotificationAudience, stats?: NotificationAudienceStats) {
  if (!stats) return null;
  if (audience === "riders") return stats.rider.users;
  if (audience === "drivers") return stats.driver.users;
  if (audience === "all") return stats.rider.users + stats.driver.users;
  return null;
}

function NotificationsPageContent() {
  const { hasPermission } = useCurrentAdmin();
  const { data: stats, isLoading: statsLoading } = useNotificationAudience();
  const send = useSendNotification();

  // Picking one user needs the users/drivers list endpoints, which have
  // their own permissions.
  const canPickRiders = hasPermission("users.manage");
  const canPickDrivers = hasPermission("drivers.manage");
  const canPickUser = canPickRiders || canPickDrivers;

  const [audience, setAudience] = useState<NotificationAudience>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastResult, setLastResult] = useState<SendNotificationResult | null>(null);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const canSend =
    trimmedTitle.length > 0 &&
    trimmedBody.length > 0 &&
    (audience !== "user" || selectedUser !== null) &&
    !send.isPending;

  const notConfigured =
    stats &&
    ((audience !== "drivers" && !stats.rider.configured) ||
      (audience !== "riders" && !stats.driver.configured));

  function doSend() {
    setConfirmOpen(false);
    send.mutate(
      {
        audience,
        userId: audience === "user" ? selectedUser?.id : undefined,
        title: trimmedTitle,
        body: trimmedBody,
      },
      {
        onSuccess: (result) => {
          setLastResult(result);
          if (result.totals.devices === 0) {
            toast.warning("No registered devices in that audience. Nothing was sent.");
          } else {
            toast.success(
              `Sent to ${result.totals.successCount} of ${result.totals.devices} device${
                result.totals.devices === 1 ? "" : "s"
              }.`,
            );
            setTitle("");
            setBody("");
          }
        },
        onError: (err) => toast.error(err.message || "Couldn't send the notification."),
      },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    // Broadcasts go to everyone at once and can't be recalled, so confirm.
    if (audience === "user") doSend();
    else setConfirmOpen(true);
  }

  const audienceOptions: {
    value: NotificationAudience;
    label: string;
    icon: LucideIcon;
    hint: string;
  }[] = [
    { value: "all", label: "Everyone", icon: Users, hint: "Riders and drivers" },
    { value: "riders", label: "All riders", icon: User, hint: "Rider app" },
    { value: "drivers", label: "All drivers", icon: Car, hint: "Driver app" },
    ...(canPickUser
      ? [{ value: "user" as const, label: "One user", icon: Search, hint: "Search by name or phone" }]
      : []),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="font-heading text-sm font-semibold text-jamogo-ink-900">Audience</h3>
          <p className="mt-0.5 text-sm text-jamogo-gray-500">
            Broadcasts skip suspended accounts and only reach people who allowed notifications.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {audienceOptions.map((opt) => {
              const active = audience === opt.value;
              const reach = reachFor(opt.value, stats);
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAudience(opt.value)}
                  aria-pressed={active}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-jamogo-green-500 bg-jamogo-green-50"
                      : "border-jamogo-gray-200 hover:border-jamogo-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      size={16}
                      className={active ? "text-jamogo-green-600" : "text-jamogo-gray-500"}
                    />
                    <span className="text-sm font-semibold text-jamogo-ink-900">{opt.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-jamogo-gray-500">
                    {reach !== null
                      ? `${reach.toLocaleString()} reachable user${reach === 1 ? "" : "s"}`
                      : statsLoading && opt.value !== "user"
                        ? "Counting..."
                        : opt.hint}
                  </p>
                </button>
              );
            })}
          </div>

          {audience === "user" && (
            <UserPicker
              selected={selectedUser}
              onSelect={setSelectedUser}
              canSearchRiders={canPickRiders}
              canSearchDrivers={canPickDrivers}
            />
          )}

          {notConfigured && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-jamogo-warning/10 px-4 py-3 text-sm text-jamogo-ink-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-jamogo-warning" />
              <span>
                Push isn&apos;t configured on the server for{" "}
                {[
                  audience !== "drivers" && !stats.rider.configured && "the rider app",
                  audience !== "riders" && !stats.driver.configured && "the driver app",
                ]
                  .filter(Boolean)
                  .join(" or ")}
                . Those users won&apos;t receive this.
              </span>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-heading text-sm font-semibold text-jamogo-ink-900">Message</h3>
          <label className="mt-4 block">
            <span className="flex justify-between text-sm font-medium text-jamogo-ink-900">
              Title
              <span className="text-xs font-normal text-jamogo-gray-500">
                {title.length}/{MAX_TITLE}
              </span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_TITLE}
              placeholder="e.g. Weekend promo"
              className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
            />
          </label>
          <label className="mt-4 block">
            <span className="flex justify-between text-sm font-medium text-jamogo-ink-900">
              Message
              <span className="text-xs font-normal text-jamogo-gray-500">
                {body.length}/{MAX_BODY}
              </span>
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={MAX_BODY}
              rows={4}
              placeholder="What do you want people to know?"
              className="mt-1.5 w-full resize-y rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
            />
          </label>
          <div className="mt-5 flex justify-end">
            <Button type="submit" disabled={!canSend}>
              <Send size={16} />
              {send.isPending ? "Sending..." : "Send notification"}
            </Button>
          </div>
        </Card>
      </form>

      <div className="space-y-6">
        <Card>
          <h3 className="font-heading text-sm font-semibold text-jamogo-ink-900">Preview</h3>
          <div className="mt-4 rounded-2xl bg-jamogo-gray-100 p-3">
            <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-jamogo-green-500 text-white">
                <Bell size={16} />
              </div>
              <div className="min-w-0">
                <p className="flex items-baseline justify-between gap-2 text-xs text-jamogo-gray-500">
                  <span className="font-semibold uppercase tracking-wide">Jamogo</span>
                  <span>now</span>
                </p>
                <p className="truncate text-sm font-semibold text-jamogo-ink-900">
                  {trimmedTitle || "Notification title"}
                </p>
                <p className="line-clamp-3 text-sm break-words text-jamogo-gray-700">
                  {trimmedBody || "Your message will appear here."}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-jamogo-gray-500">
            Phones cut off long messages, so put the important part first.
          </p>
        </Card>

        {lastResult && <ResultCard result={lastResult} />}
      </div>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Send to everyone?">
        <p className="text-sm text-jamogo-gray-700">
          This goes to{" "}
          <strong>
            {reachFor(audience, stats)?.toLocaleString() ?? "every"}{" "}
            {audience === "riders" ? "riders" : audience === "drivers" ? "drivers" : "users"}
          </strong>{" "}
          right away. A sent notification can&apos;t be recalled.
        </p>
        <div className="mt-3 rounded-xl bg-jamogo-gray-100 px-4 py-3 text-sm">
          <p className="font-semibold text-jamogo-ink-900">{trimmedTitle}</p>
          <p className="mt-0.5 break-words text-jamogo-gray-700">{trimmedBody}</p>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={doSend}>
            <Send size={16} />
            Send now
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function UserPicker({
  selected,
  onSelect,
  canSearchRiders,
  canSearchDrivers,
}: {
  selected: AdminUser | null;
  onSelect: (user: AdminUser | null) => void;
  canSearchRiders: boolean;
  canSearchDrivers: boolean;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const searching = debounced.length >= 2;
  const page = { limit: 5, offset: 0 };
  const riders = useUsers(debounced, page, searching && canSearchRiders);
  const drivers = useDrivers(debounced, page, searching && canSearchDrivers);

  if (selected) {
    return (
      <div className="mt-4 flex items-center justify-between rounded-xl border border-jamogo-green-500 bg-jamogo-green-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-jamogo-ink-900">{selected.name}</p>
          <p className="text-xs text-jamogo-gray-500">
            <span className="capitalize">{selected.role}</span> · {selected.phone}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label="Clear selected user"
          className="rounded-full p-1 text-jamogo-gray-500 hover:bg-white hover:text-jamogo-ink-900"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  const results = [...(riders.data?.users ?? []), ...(drivers.data?.drivers ?? [])];
  const loading = searching && (riders.isFetching || drivers.isFetching);

  return (
    <div className="mt-4">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-jamogo-gray-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${
            canSearchRiders && canSearchDrivers ? "riders and drivers" : canSearchRiders ? "riders" : "drivers"
          } by name, phone or email`}
          className="w-full rounded-xl border border-jamogo-gray-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-jamogo-green-500"
        />
      </div>
      {searching && (
        <div className="mt-2 overflow-hidden rounded-xl border border-jamogo-gray-200">
          {loading && results.length === 0 ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-jamogo-gray-500">No matching users.</p>
          ) : (
            <ul className="divide-y divide-jamogo-gray-100">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(user)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-jamogo-gray-100"
                  >
                    <span>
                      <span className="block text-sm font-medium text-jamogo-ink-900">{user.name}</span>
                      <span className="block text-xs text-jamogo-gray-500">{user.phone}</span>
                    </span>
                    <span className="text-xs text-jamogo-gray-500 capitalize">
                      {user.role}
                      {user.isSuspended && " · suspended"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: SendNotificationResult }) {
  const rows = [
    { label: "Rider app", r: result.results.rider },
    { label: "Driver app", r: result.results.driver },
  ].filter(({ r }) => r.devices > 0 || r.error);

  return (
    <Card>
      <h3 className="font-heading text-sm font-semibold text-jamogo-ink-900">Last send</h3>
      {result.totals.devices === 0 ? (
        <p className="mt-2 text-sm text-jamogo-gray-500">
          No one in that audience has a registered device yet.
        </p>
      ) : (
        <dl className="mt-3 space-y-3">
          {rows.map(({ label, r }) => (
            <div key={label} className="text-sm">
              <dt className="font-medium text-jamogo-ink-900">{label}</dt>
              <dd className="text-jamogo-gray-500">
                {r.error === "not_configured"
                  ? "Not sent: push isn't configured on the server for this app."
                  : `${r.successCount} delivered, ${r.failureCount} failed · ${r.users} user${
                      r.users === 1 ? "" : "s"
                    }, ${r.devices} device${r.devices === 1 ? "" : "s"}`}
                {r.error === "send_error" && " (Firebase returned an error for some devices)"}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-3 text-xs text-jamogo-gray-500">
        &quot;Delivered&quot; means Firebase accepted it. Phones that are off get it when they reconnect.
      </p>
    </Card>
  );
}
