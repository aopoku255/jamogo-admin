"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Trip, TripDetail, TripStatus } from "@/lib/types";

/** "sos" = only trips someone pressed SOS on. */
export function useTrips(status?: TripStatus | "all" | "sos", enabled = true) {
  const query =
    status === "sos" ? "?sos=1" : status && status !== "all" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["trips", query],
    queryFn: () => api.get<{ trips: Trip[] }>(`/admin/trips${query}`),
    select: (data) => data.trips,
    enabled,
  });
}

export function useTripDetail(id: string | null) {
  return useQuery({
    queryKey: ["trips", "detail", id],
    queryFn: () => api.get<TripDetail>(`/admin/trips/${id}`),
    enabled: !!id,
  });
}
