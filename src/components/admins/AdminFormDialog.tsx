"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useCreateAdmin, useUpdateAdmin } from "@/hooks/useAdmins";
import { ALL_PERMISSIONS, ROLE_PRESETS, type AdminAccount, type Permission } from "@/lib/types";

const PERMISSION_LABELS: Record<Permission, string> = {
  "kyc.review": "Review KYC submissions",
  "support.manage": "Manage support tickets",
  "users.manage": "View & suspend riders",
  "drivers.manage": "View & suspend drivers",
  "trips.view": "View trips",
  "admins.manage": "Manage other admins",
  "settings.manage": "Manage configurations",
  "logs.view": "View activity logs",
  "analytics.view": "View dashboard analytics",
  "wallet.manage": "View driver commission",
  "notifications.send": "Send push notifications",
};

export function AdminFormDialog({
  target,
  onClose,
}: {
  target: AdminAccount | "new" | null;
  onClose: () => void;
}) {
  const isCreate = target === "new";
  const admin = target && target !== "new" ? target : null;

  // Initial values only — the parent remounts this component with a fresh
  // `key` whenever `target` changes, so these never need to be synced via
  // an effect (see app/admins/page.tsx).
  const [name, setName] = useState(admin?.name ?? "");
  const [username, setUsername] = useState(admin?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(admin?.role ?? "");
  const [permissions, setPermissions] = useState<Permission[]>(admin?.permissions ?? []);
  const [isActive, setIsActive] = useState(admin?.isActive ?? true);

  const create = useCreateAdmin();
  const update = useUpdateAdmin();
  const pending = create.isPending || update.isPending;

  function applyPreset(presetRole: string) {
    setRole(presetRole);
    setPermissions(ROLE_PRESETS[presetRole] ?? []);
  }

  function togglePermission(perm: Permission) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isCreate) {
      if (!name.trim() || !username.trim() || password.length < 8 || !role) return;
      create.mutate(
        { name: name.trim(), username: username.trim(), password, role, permissions },
        {
          onSuccess: () => {
            toast.success(`${name} was added as an admin.`);
            onClose();
          },
          onError: (err) => toast.error(err.message || "Couldn't create the admin."),
        },
      );
    } else if (admin) {
      update.mutate(
        { id: admin.id, name: name.trim(), role, permissions, isActive },
        {
          onSuccess: () => {
            toast.success(`${name}'s access was updated.`);
            onClose();
          },
          onError: (err) => toast.error(err.message || "Couldn't update this admin."),
        },
      );
    }
  }

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      title={isCreate ? "Add admin" : `Edit ${admin?.name ?? ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-jamogo-ink-900">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
          />
        </div>

        {isCreate && (
          <>
            <div>
              <label className="text-sm font-medium text-jamogo-ink-900">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-jamogo-ink-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
              />
            </div>
          </>
        )}

        {!isCreate && (
          <label className="flex items-center gap-2 text-sm font-medium text-jamogo-ink-900">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-jamogo-gray-300"
            />
            Active
          </label>
        )}

        <div>
          <label className="text-sm font-medium text-jamogo-ink-900">Role preset</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {Object.keys(ROLE_PRESETS).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  role === preset
                    ? "bg-jamogo-green-500 text-white"
                    : "bg-jamogo-gray-100 text-jamogo-gray-700 hover:bg-jamogo-gray-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-jamogo-ink-900">Permissions</label>
          <div className="mt-1.5 space-y-1.5">
            {ALL_PERMISSIONS.map((perm) => (
              <label key={perm} className="flex items-center gap-2 text-sm text-jamogo-ink-900">
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  className="h-4 w-4 rounded border-jamogo-gray-300"
                />
                {PERMISSION_LABELS[perm]}
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {isCreate ? "Add admin" : "Save changes"}
        </Button>
      </form>
    </Dialog>
  );
}
