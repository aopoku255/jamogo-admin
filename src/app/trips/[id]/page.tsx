"use client";

import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/RequirePermission";
import { TripPage } from "@/components/detail/TripPage";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequirePermission permission="trips.view">
      <TripPage id={id} />
    </RequirePermission>
  );
}
