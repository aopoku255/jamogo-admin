"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { KycDecision, KycSubmission } from "@/lib/types";

export function usePendingKyc(enabled = true) {
  return useQuery({
    queryKey: ["kyc", "pending"],
    queryFn: () => api.get<{ submissions: KycSubmission[] }>("/admin/kyc/pending"),
    select: (data) => data.submissions,
    enabled,
  });
}

export function useKycDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      decision,
      reason,
    }: {
      id: string;
      decision: KycDecision;
      reason?: string;
    }) =>
      api.post<{ submission: KycSubmission }>(`/admin/kyc/${id}/decision`, {
        decision,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "pending"] });
    },
  });
}
