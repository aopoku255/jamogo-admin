"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CommissionDriver, CommissionEntry } from "@/lib/types";

export type CommissionDriverFilter = "all" | "owing" | "blocked";

/** Drivers with commission on (or still owing), most owed first, plus platform totals. */
export function useCommissionDrivers(status: CommissionDriverFilter, pagination: { limit: number; offset: number }) {
  return useQuery({
    queryKey: ["commission", "drivers", status, pagination.limit, pagination.offset],
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(pagination.limit), offset: String(pagination.offset) });
      if (status !== "all") params.set("status", status);
      return api.get<{
        drivers: CommissionDriver[];
        total: number;
        totals: { owed: number; paid: number };
      }>(`/admin/commission/drivers?${params}`);
    },
  });
}

/** The commission ledger: trip charges, MoMo payments and waivers. */
export function useCommissionEntries(
  type: CommissionEntry["type"] | "",
  pagination: { limit: number; offset: number },
) {
  return useQuery({
    queryKey: ["commission", "entries", type, pagination.limit, pagination.offset],
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(pagination.limit), offset: String(pagination.offset) });
      if (type) params.set("type", type);
      return api.get<{ entries: CommissionEntry[]; total: number }>(`/admin/commission/entries?${params}`);
    },
  });
}
