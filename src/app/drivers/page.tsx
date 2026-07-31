"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import { useDrivers } from "@/hooks/useDrivers";
import { usePagination } from "@/hooks/usePagination";
import { DriversTable } from "@/components/drivers/DriversTable";
import { UserDetailDialog } from "@/components/users/UserDetailDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { RequirePermission } from "@/components/RequirePermission";
import type { AdminUser } from "@/lib/types";

export default function DriversPage() {
  return (
    <RequirePermission permission="drivers.manage">
      <DriversPageContent />
    </RequirePermission>
  );
}

function DriversPageContent() {
  const [search, setSearch] = useState("");
  const { data: drivers, isLoading, isError } = useDrivers(search);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const pagination = usePagination(drivers ?? []);

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          pagination.setPage(1);
        }}
        placeholder="Search by name, phone, or email"
        className="w-full max-w-sm rounded-xl border border-jamogo-gray-300 px-4 py-2 text-sm outline-none focus:border-jamogo-green-500"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Car}
          title="Couldn't load drivers"
          description="Something went wrong talking to the API. Try refreshing the page."
        />
      ) : !drivers || drivers.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No drivers found"
          description={search ? "Nothing matches this search." : "No drivers have signed up yet."}
        />
      ) : (
        <>
          <DriversTable drivers={pagination.pageItems} onView={setSelected} />
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </>
      )}

      <UserDetailDialog userId={selected?.id ?? null} onClose={() => setSelected(null)} />
    </div>
  );
}
