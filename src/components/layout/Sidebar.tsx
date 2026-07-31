"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  LifeBuoy,
  Users,
  Car,
  Route,
  ShieldEllipsis,
  SlidersHorizontal,
  History,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useCurrentAdmin, useLogout } from "@/hooks/useAdminAuth";
import type { Permission } from "@/lib/types";

const COLLAPSED_STORAGE_KEY = "jamogo-sidebar-collapsed";

export const NAV_LINKS: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
}[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kyc", label: "KYC Review", icon: ShieldCheck, permission: "kyc.review" },
  { href: "/support", label: "Support Tickets", icon: LifeBuoy, permission: "support.manage" },
  { href: "/users", label: "Users", icon: Users, permission: "users.manage" },
  { href: "/drivers", label: "Drivers", icon: Car, permission: "drivers.manage" },
  { href: "/trips", label: "Trips", icon: Route, permission: "trips.view" },
  { href: "/admins", label: "Admins", icon: ShieldEllipsis, permission: "admins.manage" },
  { href: "/settings", label: "Configurations", icon: SlidersHorizontal, permission: "settings.manage" },
  { href: "/activity-logs", label: "Activity Logs", icon: History, permission: "logs.view" },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const { data: admin, hasPermission } = useCurrentAdmin();
  // Lazy-init from localStorage: safe here because Sidebar only ever mounts
  // client-side, after AdminGate's auth check resolves — it's never part of
  // the server-rendered (pre-hydration) tree, so there's no hydration
  // mismatch to worry about.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.permission || hasPermission(link.permission),
  );

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
      className={`flex h-screen shrink-0 flex-col border-r border-jamogo-gray-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {collapsed ? (
          <Image
            src="/favicon-48.png"
            alt="Jamogo"
            width={28}
            height={28}
            className="mx-auto"
          />
        ) : (
          <Image src="/brand/logo.png" alt="Jamogo" width={112} height={30} priority />
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visibleLinks.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-jamogo-green-50 text-jamogo-green-600"
                  : "text-jamogo-gray-700 hover:bg-jamogo-gray-100"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-jamogo-gray-200 p-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-jamogo-gray-500 transition-colors hover:bg-jamogo-gray-100 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && "Collapse"}
        </button>

        {admin && !collapsed && (
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-jamogo-ink-900">{admin.name}</p>
            <p className="truncate text-xs text-jamogo-gray-500">{admin.role}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          title={collapsed ? "Sign out" : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-jamogo-gray-500 transition-colors hover:bg-jamogo-gray-100 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
