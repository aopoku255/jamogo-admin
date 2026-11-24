"use client";

import { Menu } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { UserMenu } from "./UserMenu";

/** Sticky, frosted top bar: menu (phones), search, and the admin's menu. */
export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-jamogo-gray-200 bg-jamogo-bg/80 px-4 backdrop-blur-xl lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 text-jamogo-gray-700 hover:bg-jamogo-gray-100 lg:hidden"
      >
        <Menu size={20} />
      </button>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1.5">
        <UserMenu />
      </div>
    </header>
  );
}
