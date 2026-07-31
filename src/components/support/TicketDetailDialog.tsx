"use client";

import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useResolveTicket } from "@/hooks/useSupportTickets";
import type { SupportTicket } from "@/lib/types";

export function TicketDetailDialog({
  ticket,
  onClose,
}: {
  ticket: SupportTicket | null;
  onClose: () => void;
}) {
  const resolve = useResolveTicket();

  if (!ticket) return null;

  function handleResolve() {
    if (!ticket) return;
    resolve.mutate(ticket.id, {
      onSuccess: () => {
        toast.success("Ticket marked as resolved.");
        onClose();
      },
      onError: () => toast.error("Couldn't resolve the ticket. Try again."),
    });
  }

  return (
    <Dialog open={!!ticket} onClose={onClose} title={ticket.subject}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-jamogo-ink-900">
              {ticket.user.name}
            </p>
            <p className="text-sm text-jamogo-gray-500">
              {ticket.user.phone}
              {ticket.user.email ? ` · ${ticket.user.email}` : ""}
            </p>
          </div>
          <Badge tone={ticket.status === "open" ? "info" : "success"}>
            {ticket.status}
          </Badge>
        </div>

        <p className="whitespace-pre-wrap rounded-xl bg-jamogo-gray-100 p-4 text-sm text-jamogo-ink-900">
          {ticket.message}
        </p>

        {ticket.status === "open" && (
          <Button variant="primary" onClick={handleResolve} disabled={resolve.isPending}>
            Mark as resolved
          </Button>
        )}
      </div>
    </Dialog>
  );
}
