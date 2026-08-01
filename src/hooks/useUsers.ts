"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminUser, UserDetail } from "@/lib/types";

/**
 * The backend caps this at 50 rows per call by default (see the
 * production-readiness audit's pagination fix) — pass limit/offset to page
 * through the real dataset instead of only ever seeing the newest 50 users.
 */
export function useUsers(
  q?: string,
  pagination?: { limit: number; offset: number },
  enabled = true,
) {
  return useQuery({
    queryKey: ["users", q ?? "", pagination?.limit, pagination?.offset],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (pagination) {
        params.set("limit", String(pagination.limit));
        params.set("offset", String(pagination.offset));
      }
      const qs = params.toString();
      return api.get<{ users: AdminUser[]; total: number }>(`/admin/users${qs ? `?${qs}` : ""}`);
    },
    enabled,
  });
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => api.get<UserDetail>(`/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post<{ user: AdminUser }>(`/admin/users/${id}/suspend`, { reason }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "detail", id] });
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.post<{ user: AdminUser }>(`/admin/users/${id}/unsuspend`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "detail", id] });
    },
  });
}
