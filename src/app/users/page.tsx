"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { usePagination } from "@/hooks/usePagination";
import { UsersTable } from "@/components/users/UsersTable";
import { UserDetailDialog } from "@/components/users/UserDetailDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { RequirePermission } from "@/components/RequirePermission";
import type { AdminUser } from "@/lib/types";

export default function UsersPage() {
  return (
    <RequirePermission permission="users.manage">
      <UsersPageContent />
    </RequirePermission>
  );
}

function UsersPageContent() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading, isError } = useUsers(search);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const pagination = usePagination(users ?? []);

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
          icon={Users}
          title="Couldn't load users"
          description="Something went wrong talking to the API. Try refreshing the page."
        />
      ) : !users || users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={search ? "Nothing matches this search." : "No riders have signed up yet."}
        />
      ) : (
        <>
          <UsersTable users={pagination.pageItems} onView={setSelected} />
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
