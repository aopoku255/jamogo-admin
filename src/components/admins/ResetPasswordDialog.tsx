"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useResetAdminPassword } from "@/hooks/useAdmins";
import type { AdminAccount } from "@/lib/types";

export function ResetPasswordDialog({
  admin,
  onClose,
}: {
  admin: AdminAccount | null;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const resetPassword = useResetAdminPassword();

  if (!admin) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!admin || password.length < 8) return;
    resetPassword.mutate(
      { id: admin.id, password },
      {
        onSuccess: () => {
          toast.success(`${admin.name}'s password was reset.`);
          setPassword("");
          onClose();
        },
        onError: (err) => toast.error(err.message || "Couldn't reset the password."),
      },
    );
  }

  return (
    <Dialog open={!!admin} onClose={onClose} title={`Reset password for ${admin.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-jamogo-ink-900">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
          />
        </div>
        <Button type="submit" disabled={resetPassword.isPending} className="w-full">
          Reset password
        </Button>
      </form>
    </Dialog>
  );
}
