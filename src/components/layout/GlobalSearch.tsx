"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Car,
  CornerDownLeft,
  Route,
  Search,
  User,
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useDrivers } from "@/hooks/useDrivers";
import { useTrips } from "@/hooks/useTrips";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { NAV_LINKS } from "@/lib/nav";

type Result = {
  key: string;
  group: "Pages" | "Riders" | "Drivers" | "Trips";
  icon: typeof Search;
  title: string;
  subtitle?: string;
  meta?: string;
  run: () => void;
};

const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * ⌘K / Ctrl K: one box to find a rider, a driver, a trip or a page. Riders
 * and drivers are searched on the server; trips have no search endpoint, so
 * the latest ones are fetched once the box is open and filtered here.
 * Picking a person or trip opens their page.
 */
export function GlobalSearch() {
  const router = useRouter();
  const { hasPermission } = useCurrentAdmin();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Mounted client-side only (after sign-in).
  const [mac] = useState(isMac);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActive(0);
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  const q = debounced.toLowerCase();
  const searching = open && q.length > 0;
  const canRiders = hasPermission("users.manage");
  const canDrivers = hasPermission("drivers.manage");
  const canTrips = hasPermission("trips.view");

  const riders = useUsers(
    debounced,
    { limit: 5, offset: 0 },
    searching && canRiders,
  );
  const drivers = useDrivers(
    debounced,
    { limit: 5, offset: 0 },
    searching && canDrivers,
  );
  const trips = useTrips("all", open && canTrips);

  function close() {
    setOpen(false);
    setQuery("");
  }

  const results = useMemo<Result[]>(() => {
    const out: Result[] = [];
    for (const link of NAV_LINKS) {
      if (link.permission && !hasPermission(link.permission)) continue;
      if (q ? !link.label.toLowerCase().includes(q) : out.length >= 6) continue;
      out.push({
        key: `page-${link.href}`,
        group: "Pages",
        icon: link.icon,
        title: link.label,
        subtitle: link.description,
        run: () => {
          router.push(link.href);
          close();
        },
      });
    }
    if (!q) return out;
    for (const u of riders.data?.users ?? []) {
      out.push({
        key: `rider-${u.id}`,
        group: "Riders",
        icon: User,
        title: u.name,
        subtitle: [u.phone, u.email].filter(Boolean).join(" · "),
        run: () => {
          router.push(`/users/${u.id}`);
          close();
        },
      });
    }
    for (const d of drivers.data?.drivers ?? []) {
      out.push({
        key: `driver-${d.id}`,
        group: "Drivers",
        icon: Car,
        title: d.name,
        subtitle: d.phone,
        run: () => {
          router.push(`/drivers/${d.id}`);
          close();
        },
      });
    }
    const tripMatches = (trips.data ?? [])
      .filter((t) =>
        [t.rider?.name, t.rider?.phone, t.pickupLabel, t.destinationLabel, t.id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
      .slice(0, 5);
    for (const t of tripMatches) {
      out.push({
        key: `trip-${t.id}`,
        group: "Trips",
        icon: Route,
        title: `${t.pickupLabel} → ${t.destinationLabel || "…"}`,
        subtitle: `${t.rider?.name ?? "Rider"} · ${t.status}`,
        meta: `GH₵${t.yourOffer}`,
        run: () => {
          router.push(`/trips/${t.id}`);
          close();
        },
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, riders.data, drivers.data, trips.data, hasPermission]);

  const loading =
    searching && (riders.isFetching || drivers.isFetching || trips.isFetching);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    } else if (e.key === "Escape") {
      close();
    }
  }

  const groups = ["Pages", "Riders", "Drivers", "Trips"] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setActive(0);
          setOpen(true);
        }}
        className="flex max-w-md flex-1 items-center gap-2 rounded-lg bg-jamogo-gray-100 px-3 py-2 text-sm text-jamogo-gray-500 transition-colors hover:bg-jamogo-gray-200/70"
      >
        <Search size={16} className="shrink-0" />
        <span className="truncate">Search riders, drivers, trips…</span>
        <kbd className="ml-auto hidden shrink-0 items-center rounded border border-jamogo-gray-200 bg-card px-1.5 py-0.5 text-[10px] font-medium text-jamogo-gray-500 sm:inline-flex">
          {mac ? "⌘ K" : "Ctrl K"}
        </kbd>
      </button>

      {/* Rendered on <body>: the frosted top bar would otherwise clip it. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-label="Search"
              className="relative w-full max-w-xl animate-pop-in overflow-hidden rounded-2xl border border-jamogo-gray-200 bg-card shadow-card-hover"
            >
              <div className="flex items-center gap-3 border-b border-jamogo-gray-200 px-4">
                <Search size={18} className="shrink-0 text-jamogo-gray-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search riders, drivers, trips or pages…"
                  className="h-14 flex-1 bg-transparent text-[15px] text-jamogo-ink-900 outline-none placeholder:text-jamogo-gray-400"
                />
                <kbd className="rounded border border-jamogo-gray-200 px-1.5 py-0.5 text-[10px] text-jamogo-gray-500">
                  Esc
                </kbd>
              </div>

              <div className="scrollbar-thin max-h-[60vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <p className="px-3 py-10 text-center text-sm text-jamogo-gray-500">
                    {loading ? "Searching…" : `No results for "${debounced}".`}
                  </p>
                ) : (
                  groups.map((group) => {
                    const items = results.filter((r) => r.group === group);
                    if (items.length === 0) return null;
                    return (
                      <div key={group} className="mb-1">
                        <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
                          {group}
                        </p>
                        {items.map((r) => {
                          const index = results.indexOf(r);
                          const Icon = r.icon;
                          const isActive = index === active;
                          return (
                            <button
                              key={r.key}
                              type="button"
                              onMouseMove={() => setActive(index)}
                              onClick={r.run}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                isActive ? "bg-jamogo-green-50" : ""
                              }`}
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  isActive
                                    ? "bg-jamogo-green-100 text-jamogo-green-600"
                                    : "bg-jamogo-gray-100 text-jamogo-gray-500"
                                }`}
                              >
                                <Icon size={16} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-jamogo-ink-900">
                                  {r.title}
                                </span>
                                {r.subtitle && (
                                  <span className="block truncate text-xs text-jamogo-gray-500">
                                    {r.subtitle}
                                  </span>
                                )}
                              </span>
                              {r.meta && (
                                <span className="shrink-0 text-xs text-jamogo-gray-500">
                                  {r.meta}
                                </span>
                              )}
                              {isActive &&
                                (r.group === "Pages" ? (
                                  <ArrowRight
                                    size={14}
                                    className="shrink-0 text-jamogo-green-600"
                                  />
                                ) : (
                                  <CornerDownLeft
                                    size={14}
                                    className="shrink-0 text-jamogo-green-600"
                                  />
                                ))}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
