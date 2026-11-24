"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useCurrentAdmin, useLogout } from "@/hooks/useAdminAuth";
import { useTheme, type ThemeChoice } from "@/lib/theme";

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}

const THEMES: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Signed-in admin: name and role, appearance (light/dark/system), sign out. */
export function UserMenu() {
  const { data: admin } = useCurrentAdmin();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!admin) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 transition-colors outline-none hover:bg-jamogo-gray-100 focus-visible:ring-2 focus-visible:ring-jamogo-green-300"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-jamogo-green-100 text-xs font-bold text-jamogo-green-600">
          {initials(admin.name)}
        </span>
        <span className="hidden flex-col items-start leading-tight md:flex">
          <span className="text-sm font-medium text-jamogo-ink-900">{admin.name}</span>
          <span className="text-[11px] text-jamogo-gray-500">{admin.role}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 animate-pop-in rounded-xl border border-jamogo-gray-200 bg-card p-1.5 shadow-card-hover"
        >
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium text-jamogo-ink-900">{admin.name}</p>
            <p className="text-xs text-jamogo-gray-500">@{admin.username}</p>
          </div>
          <div className="my-1 border-t border-jamogo-gray-200" />
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
            Appearance
          </p>
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => setTheme(value)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-jamogo-gray-700 transition-colors hover:bg-jamogo-gray-100"
            >
              <Icon size={16} />
              {label}
              {theme === value && <Check size={15} className="ml-auto text-jamogo-green-600" />}
            </button>
          ))}
          <div className="my-1 border-t border-jamogo-gray-200" />
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-jamogo-danger transition-colors hover:bg-jamogo-danger/10"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
