import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-1 pt-1 text-sm">
      <p className="text-jamogo-gray-500">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-jamogo-gray-500 outline-none transition-colors hover:bg-jamogo-gray-100 focus-visible:ring-2 focus-visible:ring-jamogo-green-300 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="rounded-lg border border-jamogo-gray-200 bg-card px-2.5 py-1 text-xs font-medium text-jamogo-ink-900">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-jamogo-gray-500 outline-none transition-colors hover:bg-jamogo-gray-100 focus-visible:ring-2 focus-visible:ring-jamogo-green-300 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
