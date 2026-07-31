"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useKycDecision } from "@/hooks/useKyc";
import type { KycSubmission } from "@/lib/types";
import { AdminImage } from "./AdminImage";

export function KycReviewDialog({
  submission,
  onClose,
}: {
  submission: KycSubmission | null;
  onClose: () => void;
}) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const decision = useKycDecision();

  if (!submission) return null;

  function handleApprove() {
    if (!submission) return;
    decision.mutate(
      { id: submission.id, decision: "approve" },
      {
        onSuccess: () => {
          toast.success(`${submission.user.name}'s ID was approved.`);
          onClose();
        },
        onError: () => toast.error("Couldn't record the decision. Try again."),
      },
    );
  }

  function handleReject() {
    if (!submission) return;
    decision.mutate(
      { id: submission.id, decision: "reject", reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`${submission.user.name}'s ID was rejected.`);
          onClose();
        },
        onError: () => toast.error("Couldn't record the decision. Try again."),
      },
    );
  }

  return (
    <Dialog open={!!submission} onClose={onClose} title="Review identity submission">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-jamogo-ink-900">
            {submission.user.name}
          </p>
          <p className="text-sm text-jamogo-gray-500">
            {submission.user.phone}
            {submission.user.email ? ` · ${submission.user.email}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase text-jamogo-gray-500">
              ID document
            </p>
            <AdminImage
              key={submission.id}
              path={`/admin/kyc/${submission.id}/document/idDocument`}
              alt="ID document"
              className="aspect-3/2 w-full rounded-xl object-cover"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase text-jamogo-gray-500">
              Selfie
            </p>
            <AdminImage
              key={submission.id}
              path={`/admin/kyc/${submission.id}/document/selfie`}
              alt="Selfie"
              className="aspect-3/2 w-full rounded-xl object-cover"
            />
          </div>
        </div>

        {reasonOpen && (
          <div>
            <label className="text-sm font-medium text-jamogo-ink-900">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-jamogo-gray-300 px-3 py-2 text-sm outline-none focus:border-jamogo-green-500"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={handleApprove} disabled={decision.isPending}>
            Approve
          </Button>
          {reasonOpen ? (
            <Button variant="danger" onClick={handleReject} disabled={decision.isPending}>
              Confirm reject
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setReasonOpen(true)}
              disabled={decision.isPending}
            >
              Reject
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
