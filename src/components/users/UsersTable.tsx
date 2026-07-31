import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const IDENTITY_TONE = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  unverified: "neutral",
} as const;

export function UsersTable({
  users,
  onView,
}: {
  users: AdminUser[];
  onView: (user: AdminUser) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 text-xs font-semibold uppercase text-jamogo-gray-500">
            <th className="px-5 py-3">Joined</th>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Identity</th>
            <th className="px-5 py-3">Wallet</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-jamogo-gray-100 last:border-0">
              <td className="px-5 py-4 text-jamogo-gray-500">{formatDate(user.createdAt)}</td>
              <td className="px-5 py-4">
                <p className="font-medium text-jamogo-ink-900">{user.name}</p>
                <p className="text-jamogo-gray-500">
                  {user.phone}
                  {user.email ? ` · ${user.email}` : ""}
                </p>
              </td>
              <td className="px-5 py-4">
                <Badge tone={IDENTITY_TONE[user.identityStatus]}>{user.identityStatus}</Badge>
              </td>
              <td className="px-5 py-4 text-jamogo-ink-900">GH₵{user.walletBalance}</td>
              <td className="px-5 py-4">
                {user.isSuspended ? (
                  <Badge tone="danger">Suspended</Badge>
                ) : (
                  <Badge tone="success">Active</Badge>
                )}
              </td>
              <td className="px-5 py-4 text-right">
                <Button variant="secondary" onClick={() => onView(user)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
