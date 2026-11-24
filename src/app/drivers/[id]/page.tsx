"use client";

import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/RequirePermission";
import { PersonPage } from "@/components/detail/PersonPage";

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequirePermission permission="drivers.manage">
      <PersonPage id={id} kind="driver" />
    </RequirePermission>
  );
}
