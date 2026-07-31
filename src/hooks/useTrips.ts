"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Trip, TripStatus } from "@/lib/types";

export function useTrips(status?: TripStatus | "all", enabled = true) {
  const filter = status && status !== "all" ? status : undefined;
  return useQuery({
    queryKey: ["trips", filter ?? ""],
    queryFn: () =>
      api.get<{ trips: Trip[] }>(`/admin/trips${filter ? `?status=${filter}` : ""}`),
    select: (data) => data.trips,
    enabled,
  });
}

export function useTripDetail(id: string | null) {
  return useQuery({
    queryKey: ["trips", "detail", id],
    queryFn: () => api.get<{ trip: Trip }>(`/admin/trips/${id}`),
    select: (data) => data.trip,
    enabled: !!id,
  });
}
