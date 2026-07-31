import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminAccount } from "@/lib/types";

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminsTable({
  admins,
  currentAdminId,
  onEdit,
  onResetPassword,
}: {
  admins: AdminAccount[];
  currentAdminId?: string;
  onEdit: (admin: AdminAccount) => void;
  onResetPassword: (admin: AdminAccount) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 text-xs font-semibold uppercase text-jamogo-gray-500">
            <th className="px-5 py-3">Admin</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Last login</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => {
            const isSelf = admin.id === currentAdminId;
            return (
              <tr key={admin.id} className="border-b border-jamogo-gray-100 last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium text-jamogo-ink-900">
                    {admin.name}
                    {isSelf && <span className="ml-2 text-xs text-jamogo-gray-500">(you)</span>}
                  </p>
                  <p className="text-jamogo-gray-500">{admin.username}</p>
                </td>
                <td className="px-5 py-4 text-jamogo-ink-900">{admin.role}</td>
                <td className="px-5 py-4 text-jamogo-gray-500">
                  {formatDate(admin.lastLoginAt)}
                </td>
                <td className="px-5 py-4">
                  {admin.isActive ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="danger">Deactivated</Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => onEdit(admin)}
                      disabled={isSelf}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onResetPassword(admin)}
                      disabled={isSelf}
                    >
                      Reset password
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
