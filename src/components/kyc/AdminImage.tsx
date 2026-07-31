"use client";

import { useEffect, useState } from "react";
import { fetchAdminBlobUrl } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Renders one admin-gated image. Pass `key={path}` from the caller when the
 * path can change under the same component position — that remounts a fresh
 * instance instead of needing to reset state inside the effect.
 */
export function AdminImage({
  path,
  alt,
  className = "",
}: {
  path: string;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    fetchAdminBlobUrl(path)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        objectUrl = u;
        setUrl(u);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-jamogo-gray-100 text-xs text-jamogo-gray-500 ${className}`}
      >
        Couldn&apos;t load image
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-jamogo-gray-100 ${className}`}
      >
        <Spinner />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- blob: object URL, next/image can't optimize this
  return <img src={url} alt={alt} className={className} />;
}
