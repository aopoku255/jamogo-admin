"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminAccount, Permission } from "@/lib/types";

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: () => api.get<{ admins: AdminAccount[] }>("/admin/admins"),
    select: (data) => data.admins,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      username: string;
      password: string;
      role: string;
      permissions: Permission[];
    }) => api.post<{ admin: AdminAccount }>("/admin/admins", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admins"] }),
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      name?: string;
      role?: string;
      permissions?: Permission[];
      isActive?: boolean;
    }) => api.patch<{ admin: AdminAccount }>(`/admin/admins/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admins"] }),
  });
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.post<{ admin: AdminAccount }>(`/admin/admins/${id}/reset-password`, { password }),
  });
}
