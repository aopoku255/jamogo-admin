"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  NotificationAudience,
  NotificationAudienceStats,
  SendNotificationResult,
} from "@/lib/types";

export function useNotificationAudience() {
  return useQuery({
    queryKey: ["notifications", "audience"],
    queryFn: () => api.get<NotificationAudienceStats>("/admin/notifications/audience"),
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      audience: NotificationAudience;
      userId?: string;
      title: string;
      body: string;
    }) => api.post<SendNotificationResult>("/admin/notifications/send", input),
    onSuccess: () => {
      // Sending prunes dead tokens, so reach can drop afterwards.
      queryClient.invalidateQueries({ queryKey: ["notifications", "audience"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });
}
