"use client";

import { useState } from "react";
import { Route } from "lucide-react";
import { useTrips } from "@/hooks/useTrips";
import { usePagination } from "@/hooks/usePagination";
import { TripsTable } from "@/components/trips/TripsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { RequirePermission } from "@/components/RequirePermission";
import type { TripStatus } from "@/lib/types";

type Filter = "all" | TripStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "searching", label: "Searching" },
  { value: "matched", label: "Matched" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function TripsPage() {
  return (
    <RequirePermission permission="trips.view">
      <TripsPageContent />
    </RequirePermission>
  );
}

function TripsPageContent() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: trips, isLoading, isError } = useTrips(filter);
  const pagination = usePagination(trips ?? []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setFilter(f.value);
              pagination.setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "bg-jamogo-green-500 text-white"
                : "bg-card text-jamogo-gray-700 hover:bg-jamogo-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Route}
          title="Couldn't load trips"
          description="Something went wrong talking to the API. Try refreshing the page."
        />
      ) : !trips || trips.length === 0 ? (
        <EmptyState icon={Route} title="No trips found" description="Nothing matches this filter right now." />
      ) : (
        <>
          <TripsTable trips={pagination.pageItems} />
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </>
      )}
    </div>
  );
}
