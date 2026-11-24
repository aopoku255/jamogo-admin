"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { usePagination } from "@/hooks/usePagination";
import { TicketsTable } from "@/components/support/TicketsTable";
import { TicketDetailDialog } from "@/components/support/TicketDetailDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { RequirePermission } from "@/components/RequirePermission";
import type { SupportTicket, TicketStatus } from "@/lib/types";

type Filter = "all" | TicketStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

export default function SupportPage() {
  return (
    <RequirePermission permission="support.manage">
      <SupportPageContent />
    </RequirePermission>
  );
}

function SupportPageContent() {
  const { data: tickets, isLoading, isError } = useSupportTickets();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const filtered = (tickets ?? []).filter((t) => filter === "all" || t.status === filter);
  const pagination = usePagination(filtered);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={LifeBuoy}
        title="Couldn't load support tickets"
        description="Something went wrong talking to the API. Try refreshing the page."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No tickets here"
          description="Nothing matches this filter right now."
        />
      ) : (
        <>
          <TicketsTable tickets={pagination.pageItems} onView={setSelected} />
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </>
      )}

      <TicketDetailDialog ticket={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
