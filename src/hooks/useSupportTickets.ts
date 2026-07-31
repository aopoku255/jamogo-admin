"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SupportTicket } from "@/lib/types";

export function useSupportTickets(enabled = true) {
  return useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => api.get<{ tickets: SupportTicket[] }>("/admin/support-tickets"),
    select: (data) => data.tickets,
    enabled,
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ ticket: SupportTicket }>(`/admin/support-tickets/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}
