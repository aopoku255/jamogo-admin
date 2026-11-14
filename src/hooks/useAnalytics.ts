"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalyticsOverview, ShareSearchStats } from "@/lib/types";

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
