"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Topbar } from "./Topbar";
import { navLinkFor } from "@/lib/nav";

/**
 * Sidebar + top bar around every page, with the page's title and a line
 * describing it (from lib/nav.ts) above its content.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = navLinkFor(pathname);

  return (
    <div className="flex min-h-screen bg-jamogo-bg">
      <Sidebar />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main key={pathname} className="flex-1 animate-fade-in p-4 lg:p-6">
          {/* Detail pages (/trips/123…) draw their own header. */}
          {current && current.href === pathname && (
            <div className="mb-6">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-jamogo-ink-900">
                {current.href === "/" ? "Dashboard overview" : current.label}
              </h1>
              <p className="mt-1 text-sm text-jamogo-gray-500">{current.description}</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
