import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { KycSubmission } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function KycTable({
  submissions,
  onReview,
}: {
  submissions: KycSubmission[];
  onReview: (submission: KycSubmission) => void;
}) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-jamogo-gray-200 bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jamogo-gray-200 bg-jamogo-gray-50 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
            <th className="px-5 py-3">Submitted</th>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id} className="border-b border-jamogo-gray-100 transition-colors last:border-0 hover:bg-jamogo-gray-50">
              <td className="px-5 py-3 text-jamogo-gray-500">
                {formatDate(submission.createdAt)}
              </td>
              <td className="px-5 py-3">
                <p className="font-medium text-jamogo-ink-900">{submission.user.name}</p>
                <p className="text-jamogo-gray-500">{submission.user.phone}</p>
              </td>
              <td className="px-5 py-3">
                <Badge tone="warning">{submission.status}</Badge>
              </td>
              <td className="px-5 py-3 text-right">
                <Button variant="secondary" onClick={() => onReview(submission)}>
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
