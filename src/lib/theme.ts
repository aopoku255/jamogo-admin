"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "jamogo-admin-theme";

/**
 * Runs before first paint (inlined in app/layout.tsx), so a dark-mode admin
 * never flashes white on load.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

function readChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // ignore
  }
  return "system";
}

/** Light / Dark / System, remembered on this browser. */
export function useTheme() {
  // Only used client-side (after sign-in), so reading storage up front is safe.
  const [theme, setThemeState] = useState<ThemeChoice>(() =>
    typeof window === "undefined" ? "system" : readChoice(),
  );

  // "System" follows the OS live.
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((choice: ThemeChoice) => {
    setThemeState(choice);
    apply(choice);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, choice);
    } catch {
      // ignore
    }
  }, []);

  return { theme, setTheme };
}
