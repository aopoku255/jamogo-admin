import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SupportTicket } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TicketsTable({
  tickets,
  onView,
}: {
  tickets: SupportTicket[];
  onView: (ticket: SupportTicket) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 text-xs font-semibold uppercase text-jamogo-gray-500">
            <th className="px-5 py-3">Created</th>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Subject</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-jamogo-gray-100 last:border-0">
              <td className="px-5 py-4 text-jamogo-gray-500">
                {formatDate(ticket.createdAt)}
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-jamogo-ink-900">{ticket.user.name}</p>
                <p className="text-jamogo-gray-500">{ticket.user.phone}</p>
              </td>
              <td className="max-w-xs truncate px-5 py-4 text-jamogo-ink-900">
                {ticket.subject}
              </td>
              <td className="px-5 py-4">
                <Badge tone={ticket.status === "open" ? "info" : "success"}>
                  {ticket.status}
                </Badge>
              </td>
              <td className="px-5 py-4 text-right">
                <Button variant="secondary" onClick={() => onView(ticket)}>
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
