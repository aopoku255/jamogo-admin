"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { rangeFromParams } from "@/lib/dates";
import type { DateRange } from "@/lib/types";

/**
 * A report's dates (and tab) live in the address (?from=&to=&tab=), so a
 * report can be bookmarked or shared and Back returns to the same view.
 */
export function useReportParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const range = rangeFromParams(params);
  const set = (next: Record<string, string>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) p.set(k, v);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };
  return {
    range,
    tab: params.get("tab"),
    setRange: (r: DateRange) => set({ from: r.from, to: r.to }),
    setTab: (t: string) => set({ tab: t }),
    query: `from=${range.from}&to=${range.to}`,
  };
}
