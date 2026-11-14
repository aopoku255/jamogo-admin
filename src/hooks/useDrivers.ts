"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminUser, DriverProfile } from "@/lib/types";

/**
 * The backend caps this at 50 rows per call by default (see the
 * production-readiness audit's pagination fix) — pass limit/offset to page
 * through the real dataset instead of only ever seeing the newest 50 drivers.
 */
export function useDrivers(
  q?: string,
  pagination?: { limit: number; offset: number },
  enabled = true,
) {
  return useQuery({
    queryKey: ["drivers", q ?? "", pagination?.limit, pagination?.offset],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (pagination) {
        params.set("limit", String(pagination.limit));
        params.set("offset", String(pagination.offset));
      }
      const qs = params.toString();
      return api.get<{ drivers: AdminUser[]; total: number }>(`/admin/drivers${qs ? `?${qs}` : ""}`);
    },
    enabled,
  });
}

/** Any subset of a driver's commission settings: on/off, rate (0–1), limit (GH₵). */
export function useSetDriverCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      ...settings
    }: {
      userId: string;
      commissionEnabled?: boolean;
      commissionRate?: number;
      commissionLimit?: number;
    }) => api.patch<{ profile: DriverProfile }>(`/admin/drivers/${userId}/commission`, settings),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["commission"] });
      queryClient.invalidateQueries({ queryKey: ["users", "detail", userId] });
    },
  });
}

/** Clears some or all of what a driver owes (e.g. they paid in cash). Omit amount for all of it. */
export function useWaiveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, amount, note }: { userId: string; amount?: number; note?: string }) =>
      api.post<{ owed: number }>(`/admin/drivers/${userId}/commission/waive`, { amount, note }),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["commission"] });
      queryClient.invalidateQueries({ queryKey: ["users", "detail", userId] });
    },
  });
}
