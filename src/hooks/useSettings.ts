"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Setting } from "@/lib/types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ settings: Setting[] }>("/admin/settings"),
    select: (data) => data.settings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: { key: string; value: boolean | number | string }[]) =>
      api.patch<{ settings: Setting[] }>("/admin/settings", { updates }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}
