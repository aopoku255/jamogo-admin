import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
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

export function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 bg-jamogo-gray-50 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
            <th className="px-5 py-3">Joined</th>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Identity</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-jamogo-gray-100 transition-colors last:border-0 hover:bg-jamogo-gray-50"
            >
              <td className="px-5 py-3 text-jamogo-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-5 py-3">
                <Link
                  href={`/users/${user.id}`}
                  className="font-medium text-jamogo-ink-900 hover:text-jamogo-green-600 hover:underline"
                >
                  {user.name}
                </Link>
                <p className="text-jamogo-gray-500">
                  {user.phone}
                  {user.email ? ` · ${user.email}` : ""}
                </p>
              </td>
              <td className="px-5 py-3">
                <Badge tone={IDENTITY_TONE[user.identityStatus]}>
                  {user.identityStatus}
                </Badge>
              </td>
              <td className="px-5 py-3">
                {user.isSuspended ? (
                  <Badge tone="danger">Suspended</Badge>
                ) : (
                  <Badge tone="success">Active</Badge>
                )}
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/users/${user.id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-jamogo-gray-300 bg-card px-4 text-sm font-semibold text-jamogo-ink-900 shadow-sm transition-colors hover:bg-jamogo-gray-50"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
