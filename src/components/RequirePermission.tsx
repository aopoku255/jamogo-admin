"use client";

import { Lock } from "lucide-react";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Permission } from "@/lib/types";

/**
 * Defense-in-depth for direct URL navigation — the backend already 403s
 * these requests, this just avoids showing a confusing error-state page.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission | Permission[];
  children: React.ReactNode;
}) {
  const { hasPermission, isLoading } = useCurrentAdmin();
  const perms = Array.isArray(permission) ? permission : [permission];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!hasPermission(...perms)) {
    return (
      <EmptyState
        icon={Lock}
        title="Not authorized"
        description="Your account doesn't have permission to view this section."
      />
    );
  }

  return <>{children}</>;
}
