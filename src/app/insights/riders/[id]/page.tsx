"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/RequirePermission";
import { Spinner } from "@/components/ui/Spinner";
import { RiderReportPage } from "@/components/insights/PersonReport";

export default function RiderInsightsPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequirePermission permission="analytics.view">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        }
      >
        <RiderReportPage id={id} />
      </Suspense>
    </RequirePermission>
  );
}
