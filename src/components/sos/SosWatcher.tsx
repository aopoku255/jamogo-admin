"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Siren } from "lucide-react";
import { useSosSummary } from "@/hooks/useSos";
import { timeAgo } from "@/lib/dates";

/**
 * A short alarm made with Web Audio, so there's no sound file to ship.
 * Browsers only play sound after someone has clicked on the page; before
 * that it fails quietly and the toast and banner still show.
 */
function playAlarm() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    // Rejects when the browser won't play sound yet; the toast still shows.
    ctx.resume().catch(() => {});
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0.18;
    // Three high-low pairs, about 1.8 seconds.
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = i % 2 === 0 ? 960 : 720;
      osc.connect(gain);
      const at = ctx.currentTime + i * 0.3;
      osc.start(at);
      osc.stop(at + 0.24);
    }
    setTimeout(() => ctx.close().catch(() => {}), 2500);
  } catch {
    // No sound available: the toast and banner are enough.
  }
}

/**
 * Sounds the alarm and shows a toast when a new SOS comes in, on every
 * admin page. Lives outside the page content so moving between pages
 * doesn't make it forget what it has already announced.
 */
export function SosAlarm() {
  const { data } = useSosSummary();
  const router = useRouter();
  // undefined until the first answer, so alerts already open when the admin
  // loads don't sound the alarm (the banner shows them).
  const lastSeen = useRef<string | null | undefined>(undefined);

  const latestId = data?.latest?.id ?? null;
  const latestName = data?.latest?.name ?? null;
  const loaded = !!data;

  useEffect(() => {
    if (!loaded) return;
    if (lastSeen.current === undefined) {
      lastSeen.current = latestId;
      return;
    }
    if (latestId && latestId !== lastSeen.current) {
      playAlarm();
      toast.error(`${latestName ?? "Someone"} pressed SOS`, {
        id: `sos-${latestId}`,
        description: "Call them now. Open the alert for their trip and phone number.",
        duration: Infinity,
        action: { label: "Open", onClick: () => router.push("/sos") },
      });
    }
    lastSeen.current = latestId;
  }, [loaded, latestId, latestName, router]);

  return null;
}

/** A red banner at the top of every page while an SOS is open (not on the SOS page itself). */
export function SosBanner() {
  const { data } = useSosSummary();
  const pathname = usePathname();

  if (!data || data.open === 0 || pathname === "/sos") return null;

  return (
    <Link
      href="/sos"
      className="mb-5 flex items-center gap-3 rounded-2xl bg-jamogo-danger px-4 py-3 text-white shadow-card transition-opacity hover:opacity-95"
    >
      <span className="flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-full bg-white/20">
        <Siren size={18} />
      </span>
      <span className="min-w-0 flex-1 text-sm">
        <span className="block font-bold">
          {data.open} open SOS alert{data.open === 1 ? "" : "s"}
        </span>
        {data.latest && (
          <span className="block truncate text-white/85">
            Latest: {data.latest.name ?? "Someone"}, {timeAgo(data.latest.createdAt)}. Nobody has
            picked {data.open === 1 ? "it" : "them"} up yet.
          </span>
        )}
      </span>
      <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-jamogo-danger">
        View
      </span>
    </Link>
  );
}
