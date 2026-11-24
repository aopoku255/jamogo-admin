"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DateRange,
  DriverReport,
  DriversInsights,
  RiderReport,
  RidersInsights,
  Settlements,
} from "@/lib/types";

const qs = (r: DateRange) => `from=${r.from}&to=${r.to}`;

export function useDriversInsights(range: DateRange, enabled = true) {
  return useQuery({
    queryKey: ["insights", "drivers", range.from, range.to],
    queryFn: () =>
      api.get<DriversInsights>(`/admin/insights/drivers?${qs(range)}`),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useRidersInsights(range: DateRange, enabled = true) {
  return useQuery({
    queryKey: ["insights", "riders", range.from, range.to],
    queryFn: () =>
      api.get<RidersInsights>(`/admin/insights/riders?${qs(range)}`),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useDriverReport(id: string, range: DateRange) {
  return useQuery({
    queryKey: ["insights", "driver", id, range.from, range.to],
    queryFn: () =>
      api.get<DriverReport>(`/admin/insights/drivers/${id}?${qs(range)}`),
    placeholderData: (previous) => previous,
  });
}

export function useRiderReport(id: string, range: DateRange) {
  return useQuery({
    queryKey: ["insights", "rider", id, range.from, range.to],
    queryFn: () =>
      api.get<RiderReport>(`/admin/insights/riders/${id}?${qs(range)}`),
    placeholderData: (previous) => previous,
  });
}

/** One driver's report for a range, fetched on demand (e.g. to build a statement PDF). */
export function fetchDriverReport(id: string, range: DateRange) {
  return api.get<DriverReport>(`/admin/insights/drivers/${id}?${qs(range)}`);
}

export function useSettlements(month: string) {
  return useQuery({
    queryKey: ["settlements", month],
    queryFn: () => api.get<Settlements>(`/admin/settlements?month=${month}`),
    placeholderData: (previous) => previous,
  });
}
