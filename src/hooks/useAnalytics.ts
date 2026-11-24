"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AnalyticsOverview,
  DashboardData,
  DashboardPeriod,
  ShareSearchStats,
} from "@/lib/types";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => api.get<AnalyticsOverview>("/admin/analytics/overview"),
  });
}

export function useShareSearchStats(days: number) {
  return useQuery({
    queryKey: ["analytics", "share-search", days],
    queryFn: () => api.get<ShareSearchStats>(`/admin/analytics/share-search?days=${days}`),
  });
}

/** Dashboard numbers for a period; refreshed every minute so "live" stays live. */
export function useDashboard(period: DashboardPeriod, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "dashboard", period],
    queryFn: () => api.get<DashboardData>(`/admin/analytics/dashboard?period=${period}`),
    refetchInterval: 60_000,
    placeholderData: (previous) => previous,
    enabled,
  });
}
