"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import type { SosAlert, SosCounts, SosFilter, SosSummary } from "@/lib/types";

/** How often every admin page checks for a new SOS. */
export const SOS_POLL_MS = 15_000;

/** Open and acknowledged counts plus the newest open alert, checked every 15 seconds on every page. */
export function useSosSummary() {
  const { hasPermission } = useCurrentAdmin();
  return useQuery({
    queryKey: ["sos", "summary"],
    queryFn: () => api.get<SosSummary>("/admin/sos/summary"),
    enabled: hasPermission("trips.view"),
    refetchInterval: SOS_POLL_MS,
    // Keep checking in a background tab: the sound is what brings someone back.
    refetchIntervalInBackground: true,
  });
}

export function useSosAlerts(status: SosFilter) {
  return useQuery({
    queryKey: ["sos", "list", status],
    queryFn: () =>
      api.get<{ alerts: SosAlert[]; total: number; counts: SosCounts }>(
        `/admin/sos?status=${status}&limit=100`,
      ),
    refetchInterval: SOS_POLL_MS,
  });
}

function useSosAction<V>(fn: (v: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sos"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

/** "I'm on it". */
export function useAcknowledgeSos() {
  return useSosAction((id: string) => api.post(`/admin/sos/${id}/acknowledge`));
}

export function useResolveSos() {
  return useSosAction(({ id, note }: { id: string; note: string }) =>
    api.post(`/admin/sos/${id}/resolve`, { note }),
  );
}
