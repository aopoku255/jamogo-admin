"use client";

import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./Sidebar";

export function Topbar() {
  const pathname = usePathname();
  const current = NAV_LINKS.find((link) => link.href === pathname);

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-jamogo-gray-200 bg-white px-8">
      <h1 className="font-heading text-lg font-semibold text-jamogo-ink-900">
        {current?.label ?? "Dashboard"}
      </h1>
    </header>
  );
}
