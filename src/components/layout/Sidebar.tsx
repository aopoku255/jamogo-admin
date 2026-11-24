"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useCurrentAdmin } from "@/hooks/useAdminAuth";
import { NAV_GROUPS, type NavGroup } from "@/lib/nav";

const COLLAPSED_STORAGE_KEY = "jamogo-sidebar-collapsed";

/** The groups and links this admin is allowed to see. */
export function useVisibleNav(): NavGroup[] {
  const { hasPermission } = useCurrentAdmin();
  return NAV_GROUPS.map((g) => ({
    ...g,
    links: g.links.filter((l) => !l.permission || hasPermission(l.permission)),
  })).filter((g) => g.links.length > 0);
}

/** The nav links, shared by the desktop sidebar and the mobile menu. */
export function NavLinks({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = useVisibleNav();

  return (
    <nav className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-2.5 py-4">
      {groups.map((group, i) => (
        <div key={group.heading ?? i} className="space-y-0.5">
          {group.heading &&
            (collapsed ? (
              <div className="mx-3 mb-2 border-t border-sidebar-border" />
            ) : (
              <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-sidebar-foreground/45 uppercase">
                {group.heading}
              </p>
            ))}
          {group.links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                title={collapsed ? link.label : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-sidebar-accent text-white shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-jamogo-green-500" />
                )}
                <Icon
                  size={18}
                  className={`shrink-0 ${active ? "text-jamogo-green-500" : ""}`}
                />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_0_20px_rgba(31,168,76,0.35)]">
        <Image src="/favicon-48.png" alt="Jamogo" width={26} height={26} />
      </div>
      {!collapsed && (
        <div className="flex animate-fade-in flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight text-white">Jamogo Admin</span>
          <span className="text-[11px] text-sidebar-foreground/55">Ride operations</span>
        </div>
      )}
    </div>
  );
}

/** Desktop sidebar: deep Jamogo green, collapsible to icons. */
export function Sidebar() {
  // Lazy-init from localStorage: safe here because Sidebar only ever mounts
  // client-side, after AdminGate's auth check resolves.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex ${
        collapsed ? "w-19" : "w-64"
      }`}
    >
      <SidebarBrand collapsed={collapsed} />
      <NavLinks collapsed={collapsed} />
      <div className="border-t border-sidebar-border p-2.5">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/60 hover:text-white"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
