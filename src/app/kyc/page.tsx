"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { usePendingKyc } from "@/hooks/useKyc";
import { usePagination } from "@/hooks/usePagination";
import { KycTable } from "@/components/kyc/KycTable";
import { KycReviewDialog } from "@/components/kyc/KycReviewDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { RequirePermission } from "@/components/RequirePermission";
import type { KycSubmission } from "@/lib/types";

export default function KycPage() {
  return (
    <RequirePermission permission="kyc.review">
      <KycPageContent />
    </RequirePermission>
  );
}

function KycPageContent() {
  const { data: submissions, isLoading, isError } = usePendingKyc();
  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const pagination = usePagination(submissions ?? []);

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
        icon={ShieldCheck}
        title="Couldn't load KYC submissions"
        description="Something went wrong talking to the API. Try refreshing the page."
      />
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No pending submissions"
        description="Every identity verification request has been reviewed."
      />
    );
  }

  return (
    <div className="space-y-4">
      <KycTable submissions={pagination.pageItems} onReview={setSelected} />
      <Pagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
      />
      <KycReviewDialog submission={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
