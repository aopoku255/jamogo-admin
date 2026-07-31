"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminUser, UserDetail } from "@/lib/types";

export function useUsers(q?: string, enabled = true) {
  return useQuery({
    queryKey: ["users", q ?? ""],
    queryFn: () =>
      api.get<{ users: AdminUser[] }>(
        `/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      ),
    select: (data) => data.users,
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
