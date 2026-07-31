"use client";

import { useState } from "react";
import { ShieldEllipsis } from "lucide-react";
import { useAdmins } from "@/hooks/useAdmins";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { usePagination } from "@/hooks/usePagination";
import { AdminsTable } from "@/components/admins/AdminsTable";
import { AdminFormDialog } from "@/components/admins/AdminFormDialog";
import { ResetPasswordDialog } from "@/components/admins/ResetPasswordDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { RequirePermission } from "@/components/RequirePermission";
import type { AdminAccount } from "@/lib/types";

export default function AdminsPage() {
  return (
    <RequirePermission permission="admins.manage">
      <AdminsPageContent />
    </RequirePermission>
  );
}

function AdminsPageContent() {
  const { data: admins, isLoading, isError } = useAdmins();
  const { data: currentAdmin } = useCurrentAdmin();
  const [formTarget, setFormTarget] = useState<AdminAccount | "new" | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminAccount | null>(null);
  const pagination = usePagination(admins ?? []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormTarget("new")}>Add admin</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          icon={ShieldEllipsis}
          title="Couldn't load admins"
          description="Something went wrong talking to the API. Try refreshing the page."
        />
      ) : !admins || admins.length === 0 ? (
        <EmptyState icon={ShieldEllipsis} title="No admins yet" />
      ) : (
        <>
          <AdminsTable
            admins={pagination.pageItems}
            currentAdminId={currentAdmin?.id}
            onEdit={setFormTarget}
            onResetPassword={setResetTarget}
          />
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
          />
        </>
      )}

      <AdminFormDialog
        key={formTarget === "new" ? "new" : (formTarget?.id ?? "closed")}
        target={formTarget}
        onClose={() => setFormTarget(null)}
      />
      <ResetPasswordDialog admin={resetTarget} onClose={() => setResetTarget(null)} />
    </div>
  );
}
