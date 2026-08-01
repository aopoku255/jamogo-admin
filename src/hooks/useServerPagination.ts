"use client";

import { useState } from "react";

/**
 * Page state for a list whose true size lives on the server — unlike
 * usePagination (which slices an already-fully-fetched array), this derives
 * limit/offset to send as query params. Needed once an endpoint caps what
 * it returns per request instead of handing back every row (see the
 * backend's pagination — GET /admin/users, /admin/drivers, etc. now default
 * to 50 rows per call rather than the whole table).
 */
export function useServerPagination(pageSize = 10) {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * pageSize;
  return { page, setPage, offset, limit: pageSize, pageSize };
}
