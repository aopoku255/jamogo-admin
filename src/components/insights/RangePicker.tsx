"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { RANGE_PRESETS, presetRange, rangeLabel } from "@/lib/dates";
import type { DateRange } from "@/lib/types";

/** Preset periods (last 7 / 30 / 90 days, this / last month) or any two days. */
export function RangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);
  const ref = useRef<HTMLDivElement>(null);
  const active = RANGE_PRESETS.find((p) => {
    const r = presetRange(p.value);
    return r.from === value.from && r.to === value.to;
  });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const inputCls =
    "h-9 w-full rounded-lg border border-jamogo-gray-300 bg-card px-2.5 text-sm text-jamogo-ink-900 outline-none focus:border-jamogo-green-500 dark:[color-scheme:dark]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setFrom(value.from);
          setTo(value.to);
          setOpen((o) => !o);
        }}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-jamogo-gray-200 bg-card px-3 text-sm font-medium text-jamogo-ink-900 shadow-card transition-colors hover:bg-jamogo-gray-50"
      >
        <CalendarDays size={16} className="text-jamogo-gray-500" />
        {active ? active.label : rangeLabel(value)}
        <ChevronDown size={14} className="text-jamogo-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 animate-pop-in rounded-xl border border-jamogo-gray-200 bg-card p-2 shadow-card-hover">
          {RANGE_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                onChange(presetRange(p.value));
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-jamogo-gray-100 ${
                active?.value === p.value
                  ? "font-semibold text-jamogo-green-600"
                  : "text-jamogo-gray-700"
              }`}
            >
              {p.label}
              <span className="text-xs font-normal text-jamogo-gray-500">
                {rangeLabel(presetRange(p.value))}
              </span>
            </button>
          ))}
          <div className="mt-1 border-t border-jamogo-gray-200 p-2 pt-3">
            <p className="mb-2 text-[11px] font-semibold tracking-wider text-jamogo-gray-500 uppercase">
              Custom dates
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className={inputCls}
              />
              <input
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              type="button"
              disabled={!from || !to || from > to}
              onClick={() => {
                onChange({ from, to });
                setOpen(false);
              }}
              className="mt-2 h-9 w-full rounded-lg bg-jamogo-green-500 text-sm font-semibold text-white transition-colors hover:bg-jamogo-green-600 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
