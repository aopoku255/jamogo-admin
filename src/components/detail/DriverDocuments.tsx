"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, FileWarning, Maximize2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { AdminImage } from "@/components/kyc/AdminImage";
import { useDecideDriverDocument } from "@/hooks/useDrivers";
import { ApiError } from "@/lib/api";
import { formatDate } from "./parts";
import type { DriverDocument, DriverDocumentType } from "@/lib/types";

export const DOCUMENT_LABELS: Record<DriverDocumentType, string> = {
  drivers_license: "Driver's licence",
  ghana_card: "Ghana Card",
  vehicle_registration: "Vehicle registration",
  insurance: "Insurance",
  roadworthy: "Roadworthy certificate",
  profile_photo: "Profile photo",
  vehicle_photo: "Vehicle photo",
};

const TONE = {
  approved: "success",
  rejected: "danger",
  pending: "warning",
} as const;

/**
 * One card per required document: the latest upload (tap to enlarge),
 * its number and expiry, and Approve / Reject. Approving the last required
 * one approves the driver automatically (backend decideDriverDocument).
 */
export function DriverDocuments({
  documents,
  required,
  canManage,
}: {
  documents: DriverDocument[];
  required: DriverDocumentType[];
  canManage: boolean;
}) {
  const latest = new Map<DriverDocumentType, DriverDocument>();
  for (const d of documents) if (!latest.has(d.type)) latest.set(d.type, d); // newest first
  const [viewing, setViewing] = useState<DriverDocument | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        {required.map((type) => (
          <DocumentCard
            key={type}
            type={type}
            doc={latest.get(type) ?? null}
            canManage={canManage}
            onView={setViewing}
          />
        ))}
      </div>
      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? DOCUMENT_LABELS[viewing.type] : "Document"}
      >
        {viewing && (
          <AdminImage
            key={viewing.id}
            path={`/admin/driver-documents/${viewing.id}/file`}
            alt={DOCUMENT_LABELS[viewing.type]}
            className="max-h-[70vh] w-full rounded-xl object-contain"
          />
        )}
      </Dialog>
    </>
  );
}

function DocumentCard({
  type,
  doc,
  canManage,
  onView,
}: {
  type: DriverDocumentType;
  doc: DriverDocument | null;
  canManage: boolean;
  onView: (doc: DriverDocument) => void;
}) {
  const decide = useDecideDriverDocument();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const expired = doc?.expiresAt ? new Date(doc.expiresAt) < new Date() : false;

  function submit(decision: "approve" | "reject") {
    if (!doc) return;
    decide.mutate(
      {
        id: doc.id,
        decision,
        reason: decision === "reject" ? reason.trim() || undefined : undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            `${DOCUMENT_LABELS[type]} ${decision === "approve" ? "approved" : "rejected"}.`,
          );
          setRejecting(false);
          setReason("");
        },
        onError: (e) =>
          toast.error(
            e instanceof ApiError
              ? e.message
              : "Couldn't save that. Try again.",
          ),
      },
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-jamogo-gray-200 bg-card">
      <div className="relative aspect-[4/3] bg-jamogo-gray-50">
        {doc ? (
          <button
            type="button"
            onClick={() => onView(doc)}
            className="group block h-full w-full"
          >
            <AdminImage
              key={doc.id}
              path={`/admin/driver-documents/${doc.id}/file`}
              alt={DOCUMENT_LABELS[type]}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 size={14} />
            </span>
          </button>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-jamogo-gray-400">
            <FileWarning size={26} />
            <p className="mt-2 text-xs">Not uploaded yet</p>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-jamogo-ink-900">
            {DOCUMENT_LABELS[type]}
          </p>
          {doc ? (
            <Badge tone={TONE[doc.status]}>{doc.status}</Badge>
          ) : (
            <Badge>missing</Badge>
          )}
        </div>
        {doc && (
          <p className="text-xs text-jamogo-gray-500">
            Uploaded {formatDate(doc.createdAt)}
            {doc.docNumber ? ` · No. ${doc.docNumber}` : ""}
            {doc.expiresAt && (
              <span
                className={expired ? "font-semibold text-jamogo-danger" : ""}
              >
                {" "}
                · {expired ? "Expired" : "Expires"} {formatDate(doc.expiresAt)}
              </span>
            )}
          </p>
        )}
        {doc?.status === "rejected" && doc.rejectionReason && (
          <p className="rounded-lg bg-jamogo-danger/10 px-2.5 py-1.5 text-xs text-jamogo-danger">
            {doc.rejectionReason}
          </p>
        )}
        {doc && canManage && doc.status !== "approved" && !rejecting && (
          <div className="mt-auto flex gap-2 pt-1">
            <Button
              className="h-8 flex-1 px-3 text-xs"
              onClick={() => submit("approve")}
              disabled={decide.isPending}
            >
              <Check size={14} /> Approve
            </Button>
            {doc.status === "pending" && (
              <Button
                variant="secondary"
                className="h-8 flex-1 px-3 text-xs"
                onClick={() => setRejecting(true)}
                disabled={decide.isPending}
              >
                <X size={14} /> Reject
              </Button>
            )}
          </div>
        )}
        {doc && canManage && doc.status === "approved" && !rejecting && (
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="mt-auto self-start pt-1 text-xs font-medium text-jamogo-gray-500 hover:text-jamogo-danger"
          >
            Ask for a new one…
          </button>
        )}
        {rejecting && (
          <div className="mt-auto space-y-2 pt-1">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why? (the driver sees this)"
              autoFocus
              className="h-8 w-full rounded-lg border border-jamogo-gray-300 bg-card px-2.5 text-xs text-jamogo-ink-900 outline-none focus:border-jamogo-green-500"
            />
            <div className="flex gap-2">
              <Button
                variant="danger"
                className="h-8 flex-1 px-3 text-xs"
                onClick={() => submit("reject")}
                disabled={decide.isPending}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                onClick={() => setRejecting(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
