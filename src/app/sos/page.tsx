"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hand,
  MapPin,
  MessageSquareText,
  Phone,
  Route,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { RequirePermission } from "@/components/RequirePermission";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { Nothing, formatDate } from "@/components/detail/parts";
import { useAcknowledgeSos, useResolveSos, useSosAlerts } from "@/hooks/useSos";
import { ApiError } from "@/lib/api";
import { timeAgo } from "@/lib/dates";
import type { SosAlert, SosFilter } from "@/lib/types";

const STATUS = {
  open: { tone: "danger", label: "Open" },
  acknowledged: { tone: "warning", label: "Being handled" },
  resolved: { tone: "success", label: "Resolved" },
} as const;

const ROLE_LABEL = { rider: "Rider", driver: "Driver", "co-rider": "Co-rider" } as const;

export default function SosPage() {
  return (
    <RequirePermission permission="trips.view">
      <SosAlerts />
    </RequirePermission>
  );
}

function SosAlerts() {
  const [filter, setFilter] = useState<SosFilter>("active");
  const [resolving, setResolving] = useState<SosAlert | null>(null);
  const { data, isLoading, isError } = useSosAlerts(filter);
  const counts = data?.counts;

  const filters: { value: SosFilter; label: string; count?: number }[] = [
    { value: "active", label: "Needs attention", count: counts && counts.open + counts.acknowledged },
    { value: "open", label: "Open", count: counts?.open },
    { value: "acknowledged", label: "Being handled", count: counts?.acknowledged },
    { value: "resolved", label: "Resolved" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "bg-jamogo-green-500 text-white"
                : "bg-card text-jamogo-gray-700 hover:bg-jamogo-gray-100"
            }`}
          >
            {f.label}
            {!!f.count && (
              <span
                className={`rounded-full px-1.5 text-xs leading-5 ${
                  filter === f.value ? "bg-white/25" : "bg-jamogo-danger text-white"
                }`}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError || !data ? (
        <p className="text-sm text-jamogo-danger">Couldn&apos;t load SOS alerts. Try again.</p>
      ) : data.alerts.length === 0 ? (
        <div className="rounded-2xl border border-jamogo-gray-200 bg-card shadow-card">
          <Nothing
            icon={filter === "active" || filter === "open" ? ShieldCheck : Siren}
            text={
              filter === "active" || filter === "open"
                ? "No one needs help right now. New alerts show here, with a sound and a banner on every page."
                : "No alerts here."
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {data.alerts.map((a) => (
            <AlertCard key={a.id} alert={a} onResolve={() => setResolving(a)} />
          ))}
        </div>
      )}

      <ResolveDialog alert={resolving} onClose={() => setResolving(null)} />
    </div>
  );
}

function CallLink({ phone, strong = false }: { phone: string | null; strong?: boolean }) {
  if (!phone) return <span className="text-jamogo-gray-400">No phone</span>;
  return (
    <a
      href={`tel:${phone}`}
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
        strong
          ? "h-9 bg-jamogo-danger px-3 text-sm text-white hover:opacity-90"
          : "text-sm text-jamogo-green-600 hover:underline"
      }`}
    >
      <Phone size={strong ? 15 : 13} /> {phone}
    </a>
  );
}

function AlertCard({ alert: a, onResolve }: { alert: SosAlert; onResolve: () => void }) {
  const acknowledge = useAcknowledgeSos();
  const open = a.status === "open";
  const resolved = a.status === "resolved";

  async function take() {
    try {
      await acknowledge.mutateAsync(a.id);
      toast.success("You're on it. Call them, then resolve it with a note.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't update the alert. Try again.");
    }
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-card shadow-card ${
        open ? "border-jamogo-danger/60" : "border-jamogo-gray-200"
      }`}
    >
      <div
        className={`h-1 ${open ? "bg-jamogo-danger" : resolved ? "bg-jamogo-green-500" : "bg-jamogo-warning"}`}
      />
      <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_1fr_1fr]">
        {/* Who pressed it */}
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS[a.status].tone}>{STATUS[a.status].label}</Badge>
            <span
              className="flex items-center gap-1 text-xs text-jamogo-gray-500"
              title={formatDate(a.createdAt, true)}
            >
              <Clock size={12} /> {timeAgo(a.createdAt)} · {formatDate(a.createdAt, true)}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-jamogo-gray-500 uppercase">
              {ROLE_LABEL[a.raisedAs]} pressed SOS
            </p>
            {a.user ? (
              <Link
                href={a.raisedAs === "driver" ? `/drivers/${a.user.id}` : `/users/${a.user.id}`}
                className="mt-0.5 block truncate font-heading text-lg font-bold text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
              >
                {a.user.name}
              </Link>
            ) : (
              <p className="mt-0.5 font-heading text-lg font-bold text-jamogo-ink-900">Unknown user</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CallLink phone={a.user?.phone ?? null} strong={!resolved} />
            {a.mapUrl ? (
              <a
                href={a.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-jamogo-gray-300 bg-card px-3 text-sm font-semibold text-jamogo-ink-900 transition-colors hover:bg-jamogo-gray-50"
              >
                <MapPin size={15} /> Where they were <ExternalLink size={12} />
              </a>
            ) : (
              <span className="text-xs text-jamogo-gray-500">No location was sent</span>
            )}
          </div>
        </div>

        {/* The trip and the people on it */}
        <div className="min-w-0 space-y-3 text-sm">
          {a.trip ? (
            <>
              <div>
                <p className="text-xs font-semibold tracking-wider text-jamogo-gray-500 uppercase">
                  Trip
                </p>
                <Link
                  href={`/trips/${a.trip.id}`}
                  className="mt-1 flex items-start gap-1.5 font-medium text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
                >
                  <Route size={15} className="mt-0.5 shrink-0 text-jamogo-gray-500" />
                  <span className="min-w-0">
                    {a.trip.pickupLabel} to {a.trip.destinationLabel || "no destination"}
                  </span>
                </Link>
                <p className="mt-1 text-xs text-jamogo-gray-500">
                  {a.trip.mode === "share" ? "Shared ride" : "Solo ride"} · trip is {a.trip.status}
                </p>
              </div>
              {a.others.length > 0 ? (
                <ul className="space-y-2">
                  {a.others.map((p) => (
                    <li key={p.id} className="rounded-lg bg-jamogo-gray-50 px-3 py-2">
                      <p className="flex flex-wrap items-center gap-x-2 font-medium text-jamogo-ink-900">
                        {p.name}
                        <span className="text-xs font-normal text-jamogo-gray-500">
                          {ROLE_LABEL[p.role]}
                        </span>
                      </p>
                      {p.role === "driver" && (p.car || p.plate) && (
                        <p className="flex items-center gap-1.5 text-xs text-jamogo-gray-700">
                          <Car size={12} /> {[p.car, p.plate].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <CallLink phone={p.phone} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-jamogo-gray-500">No one else was on the trip yet.</p>
              )}
            </>
          ) : (
            <p className="text-jamogo-gray-500">Not on a trip when they pressed it.</p>
          )}
        </div>

        {/* Who was told, and what's been done */}
        <div className="min-w-0 space-y-3 text-sm">
          <div>
            <p className="text-xs font-semibold tracking-wider text-jamogo-gray-500 uppercase">
              Trusted contacts texted
            </p>
            {a.notifiedContacts.length ? (
              <ul className="mt-1 space-y-1">
                {a.notifiedContacts.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-x-2">
                    <span className="font-medium text-jamogo-ink-900">{c.name}</span>
                    {c.relationship && (
                      <span className="text-xs text-jamogo-gray-500">{c.relationship}</span>
                    )}
                    <CallLink phone={c.phone} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-jamogo-warning">
                Nobody. They have no trusted contacts, or SMS is switched off.
              </p>
            )}
          </div>

          <div className="space-y-1 text-xs text-jamogo-gray-500">
            {a.acknowledgedBy && a.acknowledgedAt && (
              <p className="flex items-center gap-1.5">
                <Hand size={12} /> {a.acknowledgedBy.name} took it {timeAgo(a.acknowledgedAt)}
              </p>
            )}
            {a.resolvedAt && (
              <p className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-jamogo-green-600" />
                Resolved by {a.resolvedBy?.name ?? "the system"} · {formatDate(a.resolvedAt, true)}
              </p>
            )}
          </div>
          {a.resolutionNote && (
            <p className="flex gap-2 rounded-lg bg-jamogo-gray-50 px-3 py-2 text-jamogo-ink-900">
              <MessageSquareText size={15} className="mt-0.5 shrink-0 text-jamogo-gray-500" />
              <span className="whitespace-pre-line">{a.resolutionNote}</span>
            </p>
          )}

          {!resolved && (
            <div className="flex flex-wrap gap-2 pt-1">
              {open && (
                <Button variant="danger" onClick={take} disabled={acknowledge.isPending}>
                  {acknowledge.isPending ? <Spinner className="h-4 w-4" /> : <Hand size={15} />}
                  I&apos;m on it
                </Button>
              )}
              <Button variant={open ? "secondary" : "primary"} onClick={onResolve}>
                <CheckCircle2 size={15} /> Resolve
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ResolveDialog({ alert, onClose }: { alert: SosAlert | null; onClose: () => void }) {
  const [note, setNote] = useState("");
  const resolve = useResolveSos();

  function close() {
    setNote("");
    onClose();
  }

  async function save() {
    if (!alert || !note.trim()) return;
    try {
      await resolve.mutateAsync({ id: alert.id, note: note.trim() });
      toast.success("Alert resolved.");
      close();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't resolve the alert. Try again.");
    }
  }

  return (
    <Dialog open={!!alert} onClose={close} title="Resolve SOS alert">
      <p className="text-sm text-jamogo-gray-500">
        Say what happened, so anyone looking at {alert?.user?.name ?? "this"}&apos;s alert later
        knows it was handled.
      </p>
      <label htmlFor="sos-note" className="mt-4 block text-sm font-medium text-jamogo-ink-900">
        What happened
      </label>
      <textarea
        id="sos-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        autoFocus
        maxLength={2000}
        placeholder="Called the rider, they're safe. Pressed it by mistake."
        className="mt-1.5 w-full rounded-lg border border-jamogo-gray-300 bg-card px-3 py-2 text-sm text-jamogo-ink-900 outline-none focus:border-jamogo-green-500"
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!note.trim() || resolve.isPending}>
          {resolve.isPending && <Spinner className="h-4 w-4" />} Resolve
        </Button>
      </div>
    </Dialog>
  );
}
