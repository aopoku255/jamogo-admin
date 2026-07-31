"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ActivityLog } from "@/lib/types";

export function useActivityLogs(action?: string) {
  return useQuery({
    queryKey: ["activity-logs", action ?? ""],
    queryFn: () =>
      api.get<{ logs: ActivityLog[] }>(
        `/admin/activity-logs${action ? `?action=${encodeURIComponent(action)}` : ""}`,
      ),
    select: (data) => data.logs,
  });
}
