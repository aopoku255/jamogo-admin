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

export function useSetDriverCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, commissionRate }: { userId: string; commissionRate: number }) =>
      api.patch<{ profile: DriverProfile }>(`/admin/drivers/${userId}/commission`, { commissionRate }),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["users", "detail", userId] });
    },
  });
}
