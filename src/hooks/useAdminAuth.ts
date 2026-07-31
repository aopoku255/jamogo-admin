"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  clearAdminSession,
  getAdminSessionRaw,
  setAdminSession,
  subscribeAdminSession,
  type AdminSession,
} from "@/lib/adminAuth";
import type { AdminAccount, Permission } from "@/lib/types";

function getServerSnapshot() {
  return null;
}

export function useAdminSession() {
  const raw = useSyncExternalStore(subscribeAdminSession, getAdminSessionRaw, getServerSnapshot);
  const session = useMemo<AdminSession | null>(() => {
    try {
      return raw ? (JSON.parse(raw) as AdminSession) : null;
    } catch {
      return null;
    }
  }, [raw]);

  return { session };
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.post<{ token: string; admin: AdminAccount }>("/admin/auth/login", {
        username,
        password,
      }),
    onSuccess: (data) => setAdminSession(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearAdminSession();
    queryClient.clear();
  };
}

/** Validates the stored session and hydrates the current admin's permissions. */
export function useCurrentAdmin() {
  const { session } = useAdminSession();

  const query = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => api.get<{ admin: AdminAccount }>("/admin/auth/me"),
    select: (data) => data.admin,
    enabled: !!session,
    retry: false,
  });

  function hasPermission(...perms: Permission[]) {
    const granted = query.data?.permissions ?? [];
    return perms.some((p) => granted.includes(p));
  }

  return { ...query, hasSession: !!session, hasPermission };
}
