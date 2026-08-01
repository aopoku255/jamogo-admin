"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminWalletTransaction, Payout, PayoutStatus } from "@/lib/types";

export function useWalletTransactions(pagination: { limit: number; offset: number }) {
  return useQuery({
    queryKey: ["wallet-transactions", pagination.limit, pagination.offset],
    queryFn: () =>
      api.get<{ transactions: AdminWalletTransaction[]; total: number }>(
        `/admin/wallet-transactions?limit=${pagination.limit}&offset=${pagination.offset}`,
      ),
  });
}

export function usePayouts(status: PayoutStatus | "", pagination: { limit: number; offset: number }) {
  return useQuery({
    queryKey: ["payouts", status, pagination.limit, pagination.offset],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(pagination.limit),
        offset: String(pagination.offset),
      });
      if (status) params.set("status", status);
      return api.get<{ payouts: Payout[]; total: number }>(`/admin/payouts?${params}`);
    },
  });
}

export function useResolvePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      decision,
      reason,
      providerReference,
    }: {
      id: string;
      decision: "paid" | "failed";
      reason?: string;
      providerReference?: string;
    }) => api.post<{ payout: Payout }>(`/admin/payouts/${id}/resolve`, { decision, reason, providerReference }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}
