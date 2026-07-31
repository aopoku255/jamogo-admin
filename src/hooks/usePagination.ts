"use client";

import { useMemo, useState } from "react";

/** Client-side pagination over an already-fetched list — fine at this app's data volumes. */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  return { page: safePage, setPage, pageCount, pageItems, total: items.length, pageSize };
}
