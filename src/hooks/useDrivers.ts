"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

export function useDrivers(q?: string, enabled = true) {
  return useQuery({
    queryKey: ["drivers", q ?? ""],
    queryFn: () =>
      api.get<{ drivers: AdminUser[] }>(
        `/admin/drivers${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      ),
    select: (data) => data.drivers,
    enabled,
  });
}
