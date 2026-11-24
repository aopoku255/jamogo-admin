"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { initials } from "@/components/layout/UserMenu";

export const cedis = (n: number | string | null | undefined) =>
  `GH₵${Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function formatTime(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg py-1 pr-2 text-sm font-medium text-jamogo-gray-500 transition-colors hover:text-jamogo-ink-900"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}

/** A person's photo, or their initials when there's none (or it won't load). */
export function PersonAvatar({
  name,
  url,
  size = 64,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };
  if (url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        style={style}
        onError={() => setFailed(true)}
        className="shrink-0 rounded-2xl object-cover ring-4 ring-jamogo-green-50"
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: size / 2.8 }}
      className="flex shrink-0 items-center justify-center rounded-2xl bg-jamogo-green-100 font-heading font-bold text-jamogo-green-600 ring-4 ring-jamogo-green-50"
    >
      {initials(name)}
    </span>
  );
}

/** Label on the left, value on the right. */
export function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="shrink-0 text-jamogo-gray-500">{label}</span>
      <span className="min-w-0 text-right font-medium break-words text-jamogo-ink-900">
        {children}
      </span>
    </div>
  );
}

/** An id with a copy button. */
export function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(id).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      title="Copy ID"
      className="inline-flex items-center gap-1 rounded-md bg-jamogo-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-jamogo-gray-500 transition-colors hover:text-jamogo-ink-900"
    >
      {id.slice(0, 8)}
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

export type TabDef = { key: string; label: string; count?: number };

/** Underline tabs; the page renders the active one. */
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto border-b border-jamogo-gray-200 px-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`relative -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            active === t.key
              ? "border-jamogo-green-500 text-jamogo-ink-900"
              : "border-transparent text-jamogo-gray-500 hover:text-jamogo-ink-900"
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                active === t.key
                  ? "bg-jamogo-green-100 text-jamogo-green-600"
                  : "bg-jamogo-gray-100 text-jamogo-gray-500"
              }`}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export type TimelineStep = {
  label: string;
  detail?: string;
  at?: string | null;
  icon: LucideIcon;
  tone?: "done" | "danger" | "pending";
};

/** A vertical timeline: done steps in green, a cancel in red, what hasn't happened in gray. */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const tone = step.tone ?? (step.at ? "done" : "pending");
        const dot =
          tone === "done"
            ? "bg-jamogo-green-100 text-jamogo-green-600"
            : tone === "danger"
              ? "bg-jamogo-danger/15 text-jamogo-danger"
              : "bg-jamogo-gray-100 text-jamogo-gray-400";
        return (
          <li
            key={`${step.label}-${i}`}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {i < steps.length - 1 && (
              <span
                className={`absolute top-8 bottom-0 left-[15px] w-0.5 ${
                  tone === "done"
                    ? "bg-jamogo-green-300/60"
                    : "bg-jamogo-gray-200"
                }`}
              />
            )}
            <span
              className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${dot}`}
            >
              <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p
                  className={`text-sm font-medium ${tone === "pending" ? "text-jamogo-gray-400" : "text-jamogo-ink-900"}`}
                >
                  {step.label}
                </p>
                {step.at && (
                  <p className="text-xs text-jamogo-gray-500">
                    {formatDate(step.at, true)}
                  </p>
                )}
              </div>
              {step.detail && (
                <p className="mt-0.5 text-xs text-jamogo-gray-500">
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** An empty tab or section. */
export function Nothing({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-jamogo-gray-100 text-jamogo-gray-500">
        <Icon size={22} />
      </span>
      <p className="mt-3 text-sm text-jamogo-gray-500">{text}</p>
    </div>
  );
}
