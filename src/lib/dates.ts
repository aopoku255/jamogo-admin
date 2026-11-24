import type { DateRange } from "@/lib/types";

/**
 * Calendar-day helpers for reports. Days are YYYY-MM-DD in UTC, which is
 * Ghana time, matching the backend (services/insights.service.js).
 */
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);

export type RangePreset = "7d" | "30d" | "thisMonth" | "lastMonth" | "90d";

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "90d", label: "Last 90 days" },
];

export function presetRange(preset: RangePreset, now = new Date()): DateRange {
  const today = new Date(`${isoDay(now)}T00:00:00Z`);
  switch (preset) {
    case "7d":
      return { from: isoDay(addDays(today, -6)), to: isoDay(today) };
    case "30d":
      return { from: isoDay(addDays(today, -29)), to: isoDay(today) };
    case "90d":
      return { from: isoDay(addDays(today, -89)), to: isoDay(today) };
    case "thisMonth":
      return { from: `${isoDay(today).slice(0, 7)}-01`, to: isoDay(today) };
    case "lastMonth": {
      const first = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1),
      );
      const last = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0),
      );
      return { from: isoDay(first), to: isoDay(last) };
    }
  }
}

/** "1 Nov – 24 Nov 2026" */
export function rangeLabel({ from, to }: DateRange) {
  const f = new Date(`${from}T00:00:00Z`);
  const t = new Date(`${to}T00:00:00Z`);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  };
  const year = { year: "numeric" as const, timeZone: "UTC" };
  if (from === to) return t.toLocaleDateString(undefined, { ...opts, ...year });
  return `${f.toLocaleDateString(undefined, opts)} to ${t.toLocaleDateString(undefined, { ...opts, ...year })}`;
}

/** "November 2026" for "2026-11". */
export function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function shiftMonth(month: string, by: number) {
  const d = new Date(`${month}-01T00:00:00Z`);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + by, 1))
    .toISOString()
    .slice(0, 7);
}

/** The whole of a month as a range ("2026-11" → 1–30 Nov). */
export function monthToRange(month: string): DateRange {
  const d = new Date(`${month}-01T00:00:00Z`);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return { from: `${month}-01`, to: isoDay(last) };
}

/** Reads ?from=&to= (falling back to the last 30 days). */
export function rangeFromParams(params: URLSearchParams | null): DateRange {
  const from = params?.get("from");
  const to = params?.get("to");
  const ok = (v: string | null | undefined): v is string =>
    !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
  return ok(from) && ok(to) && from <= to ? { from, to } : presetRange("30d");
}
