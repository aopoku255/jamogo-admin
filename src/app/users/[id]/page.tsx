"use client";

import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/RequirePermission";
import { PersonPage } from "@/components/detail/PersonPage";

export default function RiderDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequirePermission permission="users.manage">
      <PersonPage id={id} kind="rider" />
    </RequirePermission>
  );
}
