import type { AdminAccount } from "./types";

const STORAGE_KEY = "jamogo-admin-session";
export const ADMIN_SESSION_CHANGED_EVENT = "jamogo-admin-session-changed";

export type AdminSession = {
  token: string;
  admin: AdminAccount;
};

/** Raw string so useSyncExternalStore can compare snapshots by value (see useAdminAuth.ts). */
export function getAdminSessionRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getAdminSession(): AdminSession | null {
  const raw = getAdminSessionRaw();
  try {
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function subscribeAdminSession(callback: () => void) {
  window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function setAdminSession(session: AdminSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage unavailable (private mode, etc.) - session just won't persist
  }
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
}
