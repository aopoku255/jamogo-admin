"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Ban,
  BadgeCheck,
  Car,
  CheckCircle2,
  FileCheck2,
  History,
  Mail,
  Percent,
  Phone,
  Route,
  ShieldCheck,
  Star,
  UserX,
  UsersRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { StatsCard } from "@/components/ui/StatsCard";
import { CommissionPanel } from "@/components/drivers/CommissionPanel";
import { ACTION_LABELS } from "@/components/activityLogs/ActivityLogsTable";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import {
  useSuspendUser,
  useUnsuspendUser,
  useUserDetail,
} from "@/hooks/useUsers";
import { useSetDriverApproval } from "@/hooks/useDrivers";
import { ApiError } from "@/lib/api";
import { DriverDocuments } from "./DriverDocuments";
import { PersonTrips, driverTripRows, riderTripRows } from "./PersonTrips";
import {
  BackLink,
  CopyId,
  InfoRow,
  Nothing,
  PersonAvatar,
  Tabs,
  cedis,
  formatDate,
  type TabDef,
} from "./parts";
import type { AdminUser, UserDetail } from "@/lib/types";

const IDENTITY_TONE = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  unverified: "neutral",
} as const;

/**
 * A rider's or driver's page: who they are and their status, lifetime
 * numbers, and tabs for trips, driver documents, commission, ID checks and
 * what admins have done to the account. Suspend / lift, and (drivers)
 * approve or reject, from the header.
 */
export function PersonPage({
  id,
  kind,
}: {
  id: string;
  kind: "rider" | "driver";
}) {
  const { data, isLoading, error } = useUserDetail(id);
  const back =
    kind === "driver"
      ? { href: "/drivers", label: "Drivers" }
      : { href: "/users", label: "Riders" };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="space-y-4">
        <BackLink {...back} />
        <Nothing
          icon={UserX}
          text={
            error instanceof ApiError && error.status === 404
              ? "This account doesn't exist."
              : "Couldn't load this account. Try refreshing."
          }
        />
      </div>
    );
  }
  return <PersonBody data={data} back={back} />;
}

function PersonBody({
  data,
  back,
}: {
  data: UserDetail;
  back: { href: string; label: string };
}) {
  const { user, stats } = data;
  const isDriver = user.role === "driver";
  const { hasPermission } = useCurrentAdmin();
  const canManageDrivers = hasPermission("drivers.manage");

  const tripRows = isDriver
    ? driverTripRows(data.driverTrips)
    : riderTripRows(data.riderTrips, data.joinedTrips);
  const required = data.requiredDocumentTypes ?? [];
  const pendingDocs = data.documents.filter(
    (d) => d.status === "pending",
  ).length;

  const tabs: TabDef[] = [
    { key: "trips", label: "Trips", count: tripRows.length },
    ...(isDriver
      ? [
          {
            key: "documents",
            label: "Documents",
            count: pendingDocs || undefined,
          },
        ]
      : []),
    ...(isDriver ? [{ key: "commission", label: "Commission" }] : []),
    { key: "id", label: "ID checks", count: data.kycSubmissions.length },
    { key: "activity", label: "Admin activity", count: data.activity.length },
  ];
  // A driver with documents to review opens on them.
  const [tab, setTab] = useState(
    isDriver && pendingDocs > 0 ? "documents" : "trips",
  );

  return (
    <div className="space-y-6">
      <BackLink {...back} />

      <Header user={user} />

      {user.isSuspended && (
        <Callout tone="danger" icon={Ban}>
          Suspended {formatDate(user.suspendedAt)}
          {user.suspendedReason ? `: ${user.suspendedReason}` : ""}. They
          can&apos;t sign in or book rides until the suspension is lifted.
        </Callout>
      )}
      {isDriver && user.driverProfile?.approvalStatus !== "approved" && (
        <Callout tone="warning" icon={FileCheck2}>
          {user.driverProfile?.approvalStatus === "rejected"
            ? "This driver was rejected and can't go online."
            : `Not approved to drive yet. ${
                pendingDocs > 0
                  ? `${pendingDocs} document${pendingDocs === 1 ? "" : "s"} waiting for review.`
                  : "Waiting for their documents."
              } Approving every required document approves the driver.`}
        </Callout>
      )}
      {!isDriver && stats.rider.noShows > 0 && (
        <Callout tone="warning" icon={AlertTriangle}>
          {stats.rider.noShows} no-show{stats.rider.noShows === 1 ? "" : "s"}: a
          driver waited out the free time and this rider never came. They
          weren&apos;t charged.
        </Callout>
      )}

      {isDriver && stats.driver ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          <StatsCard
            label="Trips driven"
            value={stats.driver.tripsCompleted.toLocaleString()}
            icon={CheckCircle2}
            hint={`${stats.driver.tripsCancelled} cancelled`}
          />
          <StatsCard
            label="Fares collected"
            value={cedis(stats.driver.earnings)}
            icon={Wallet}
            hint="Paid by riders directly"
          />
          <StatsCard
            label="Commission charged"
            value={cedis(stats.driver.commissionCharged)}
            icon={Percent}
            tone="info"
            hint={`${cedis(user.driverProfile?.commissionOwed)} still owed`}
          />
          <StatsCard
            label="Shared rides"
            value={stats.driver.sharedRides.toLocaleString()}
            icon={UsersRound}
            hint="Carried co-riders"
          />
          <StatsCard
            label="Rating"
            value={Number(user.driverProfile?.rating ?? 5).toFixed(1)}
            icon={Star}
            tone="warning"
            hint={`Last trip ${formatDate(stats.driver.lastTripAt)}`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          <StatsCard
            label="Trips taken"
            value={stats.rider.tripsCompleted.toLocaleString()}
            icon={CheckCircle2}
            hint={`${stats.rider.tripsRequested} booked · ${stats.rider.tripsCancelled} cancelled`}
          />
          <StatsCard
            label="Total spent"
            value={cedis(stats.rider.spent)}
            icon={Wallet}
            hint="Paid to drivers"
          />
          <StatsCard
            label="Shared rides"
            value={stats.rider.sharedRides.toLocaleString()}
            icon={UsersRound}
            hint={`${stats.rider.joinedRides} joined someone else's`}
          />
          <StatsCard
            label="Rating"
            value={stats.rider.rating.toFixed(1)}
            icon={Star}
            tone="warning"
            hint={`From ${stats.rider.ratedTrips} rated trip${stats.rider.ratedTrips === 1 ? "" : "s"}`}
          />
          <StatsCard
            label="No-shows"
            value={String(stats.rider.noShows)}
            icon={AlertTriangle}
            tone={stats.rider.noShows > 0 ? "danger" : "neutral"}
            hint={`Last trip ${formatDate(stats.rider.lastTripAt)}`}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-jamogo-gray-200 bg-card shadow-card xl:col-span-2">
          <div className="px-6 pt-3">
            <Tabs tabs={tabs} active={tab} onChange={setTab} />
          </div>
          <div className="px-6 py-5">
            {tab === "trips" && (
              <PersonTrips
                rows={tripRows}
                otherLabel={isDriver ? "Rider" : "Driver"}
                amountLabel={isDriver ? "Collected" : "Paid"}
              />
            )}
            {tab === "documents" && (
              <DriverDocuments
                documents={data.documents}
                required={required}
                canManage={canManageDrivers}
              />
            )}
            {tab === "commission" && (
              <CommissionPanel user={user} entries={data.commissionEntries} />
            )}
            {tab === "id" &&
              (data.kycSubmissions.length === 0 ? (
                <Nothing icon={ShieldCheck} text="No ID submitted yet." />
              ) : (
                <div className="divide-y divide-jamogo-gray-100">
                  {data.kycSubmissions.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span className="text-jamogo-ink-900">
                        Submitted {formatDate(k.createdAt, true)}
                      </span>
                      <Badge
                        tone={
                          IDENTITY_TONE[
                            k.status as keyof typeof IDENTITY_TONE
                          ] ?? "neutral"
                        }
                      >
                        {k.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ))}
            {tab === "activity" &&
              (data.activity.length === 0 ? (
                <Nothing
                  icon={History}
                  text="No admin has changed this account."
                />
              ) : (
                <ol className="divide-y divide-jamogo-gray-100">
                  {data.activity.map((a) => {
                    const reason =
                      typeof a.metadata?.reason === "string"
                        ? a.metadata.reason
                        : null;
                    return (
                      <li
                        key={a.id}
                        className="flex items-start justify-between gap-4 py-3 text-sm"
                      >
                        <span>
                          <span className="font-medium text-jamogo-ink-900">
                            {ACTION_LABELS[a.action] ?? a.action}
                          </span>
                          <span className="text-jamogo-gray-500">
                            {" "}
                            by {a.admin?.name ?? "an admin"}
                            {reason ? ` · "${reason}"` : ""}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-jamogo-gray-500">
                          {formatDate(a.createdAt, true)}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-jamogo-gray-200 bg-card px-6 py-4 shadow-card">
            <h3 className="mb-1 font-heading text-base font-semibold text-jamogo-ink-900">
              Account
            </h3>
            <div className="divide-y divide-jamogo-gray-100">
              <InfoRow label="Joined">{formatDate(user.createdAt)}</InfoRow>
              <InfoRow label="Phone">
                {user.phone}{" "}
                {user.phoneVerified && (
                  <BadgeCheck
                    size={14}
                    className="inline text-jamogo-green-600"
                  />
                )}
              </InfoRow>
              <InfoRow label="Email">
                {user.email ?? "—"}{" "}
                {user.email && user.emailVerified && (
                  <BadgeCheck
                    size={14}
                    className="inline text-jamogo-green-600"
                  />
                )}
              </InfoRow>
              <InfoRow label="ID check">
                <Badge tone={IDENTITY_TONE[user.identityStatus]}>
                  {user.identityStatus}
                </Badge>
              </InfoRow>
              <InfoRow label="Account ID">
                <CopyId id={user.id} />
              </InfoRow>
            </div>
          </div>
          {isDriver && user.driverProfile && (
            <div className="rounded-2xl border border-jamogo-gray-200 bg-card px-6 py-4 shadow-card">
              <h3 className="mb-1 font-heading text-base font-semibold text-jamogo-ink-900">
                Vehicle
              </h3>
              <div className="divide-y divide-jamogo-gray-100">
                <InfoRow label="Car">
                  {[user.driverProfile.carMake, user.driverProfile.carModel]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </InfoRow>
                <InfoRow label="Plate">
                  {user.driverProfile.plateNumber ?? "—"}
                </InfoRow>
                <InfoRow label="Status">
                  {user.driverProfile.isOnline ? (
                    <Badge tone="success">Online</Badge>
                  ) : (
                    <Badge>Offline</Badge>
                  )}
                </InfoRow>
                <InfoRow label="Commission">
                  {user.driverProfile.commissionEnabled
                    ? `${Math.round(Number(user.driverProfile.commissionRate) * 100)}%`
                    : "Off"}
                </InfoRow>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Callout({
  tone,
  icon: Icon,
  children,
}: {
  tone: "danger" | "warning";
  icon: typeof Ban;
  children: React.ReactNode;
}) {
  const cls =
    tone === "danger"
      ? "border-jamogo-danger/30 bg-jamogo-danger/8 text-jamogo-danger"
      : "border-jamogo-warning/35 bg-jamogo-warning/10 text-jamogo-ink-900";
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${cls}`}
    >
      <Icon
        size={18}
        className={`mt-0.5 shrink-0 ${tone === "warning" ? "text-jamogo-warning" : ""}`}
      />
      <p>{children}</p>
    </div>
  );
}

/** Photo, name, status badges, contact, and the account actions. */
function Header({ user }: { user: AdminUser }) {
  const isDriver = user.role === "driver";
  const profile = user.driverProfile;
  const { hasPermission } = useCurrentAdmin();
  const canSuspend = hasPermission(
    isDriver ? "drivers.manage" : "users.manage",
  );
  const canApprove = isDriver && hasPermission("drivers.manage");
  const [dialog, setDialog] = useState<null | "suspend" | "reject">(null);
  const [reason, setReason] = useState("");
  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();
  const approval = useSetDriverApproval();

  const fail = (e: unknown) =>
    toast.error(
      e instanceof ApiError ? e.message : "Couldn't save that. Try again.",
    );

  function confirm() {
    if (dialog === "suspend") {
      suspend.mutate(
        { id: user.id, reason: reason.trim() || undefined },
        {
          onSuccess: () => {
            toast.success(`${user.name} was suspended.`);
            setDialog(null);
            setReason("");
          },
          onError: fail,
        },
      );
    } else if (dialog === "reject") {
      approval.mutate(
        {
          userId: user.id,
          decision: "reject",
          reason: reason.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast.success(`${user.name} was rejected as a driver.`);
            setDialog(null);
            setReason("");
          },
          onError: fail,
        },
      );
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-jamogo-gray-200 bg-card p-6 shadow-card">
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-jamogo-green-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <PersonAvatar name={user.name} url={user.avatarUrl} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-jamogo-ink-900">
              {user.name}
            </h1>
            <Badge tone={isDriver ? "info" : "neutral"}>
              {isDriver ? "Driver" : "Rider"}
            </Badge>
            {user.isSuspended ? (
              <Badge tone="danger">Suspended</Badge>
            ) : (
              <Badge tone="success">Active</Badge>
            )}
            {user.identityStatus === "verified" && (
              <Badge tone="success">ID verified</Badge>
            )}
            {isDriver && profile?.approvalStatus && (
              <Badge
                tone={
                  profile.approvalStatus === "approved"
                    ? "success"
                    : profile.approvalStatus === "rejected"
                      ? "danger"
                      : "warning"
                }
              >
                {profile.approvalStatus === "approved"
                  ? "Approved to drive"
                  : profile.approvalStatus}
              </Badge>
            )}
            {isDriver && profile?.isOnline && (
              <Badge tone="success">Online now</Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-jamogo-gray-500">
            <a
              href={`tel:${user.phone}`}
              className="inline-flex items-center gap-1.5 hover:text-jamogo-ink-900"
            >
              <Phone size={14} /> {user.phone}
            </a>
            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="inline-flex items-center gap-1.5 hover:text-jamogo-ink-900"
              >
                <Mail size={14} /> {user.email}
              </a>
            )}
            {isDriver && profile?.plateNumber && (
              <span className="inline-flex items-center gap-1.5">
                <Car size={14} /> {profile.plateNumber}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Route size={14} /> Joined {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {canApprove && profile?.approvalStatus !== "approved" && (
            <Button
              onClick={() =>
                approval.mutate(
                  { userId: user.id, decision: "approve" },
                  {
                    onSuccess: () =>
                      toast.success(`${user.name} can now go online.`),
                    onError: fail,
                  },
                )
              }
              disabled={approval.isPending}
            >
              <CheckCircle2 size={16} /> Approve driver
            </Button>
          )}
          {canApprove && profile?.approvalStatus !== "rejected" && (
            <Button variant="secondary" onClick={() => setDialog("reject")}>
              <XCircle size={16} /> Reject driver
            </Button>
          )}
          {canSuspend &&
            (user.isSuspended ? (
              <Button
                variant="secondary"
                onClick={() =>
                  unsuspend.mutate(user.id, {
                    onSuccess: () =>
                      toast.success(`${user.name}'s suspension was lifted.`),
                    onError: fail,
                  })
                }
                disabled={unsuspend.isPending}
              >
                Lift suspension
              </Button>
            ) : (
              <Button variant="danger" onClick={() => setDialog("suspend")}>
                <Ban size={16} /> Suspend
              </Button>
            ))}
        </div>
      </div>

      <Dialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={
          dialog === "suspend"
            ? `Suspend ${user.name}?`
            : `Reject ${user.name} as a driver?`
        }
      >
        <p className="text-sm text-jamogo-gray-500">
          {dialog === "suspend"
            ? "They won't be able to sign in or book or take rides until you lift it."
            : "They won't be able to go online. They can upload new documents and be approved later."}
        </p>
        <label className="mt-4 block text-sm font-medium text-jamogo-ink-900">
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          autoFocus
          className="mt-1.5 w-full rounded-lg border border-jamogo-gray-300 bg-card px-3 py-2 text-sm text-jamogo-ink-900 outline-none focus:border-jamogo-green-500"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirm}
            disabled={suspend.isPending || approval.isPending}
          >
            {dialog === "suspend" ? "Suspend" : "Reject driver"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
