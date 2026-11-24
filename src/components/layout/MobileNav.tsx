"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { NavLinks, SidebarBrand } from "./Sidebar";

/** The sidebar as a slide-in panel on small screens. */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside className="relative flex h-full w-72 animate-fade-in flex-col bg-sidebar text-sidebar-foreground shadow-2xl">
        <div className="relative">
          <SidebarBrand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <NavLinks onNavigate={onClose} />
      </aside>
    </div>
  );
}
