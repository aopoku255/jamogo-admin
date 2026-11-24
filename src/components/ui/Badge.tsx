type BadgeTone = "warning" | "success" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  warning: "bg-jamogo-warning/15 text-jamogo-warning",
  success: "bg-jamogo-green-100 text-jamogo-green-600",
  danger: "bg-jamogo-danger/15 text-jamogo-danger",
  info: "bg-jamogo-info/15 text-jamogo-info",
  neutral: "bg-jamogo-gray-100 text-jamogo-gray-500",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  warning: "bg-jamogo-warning",
  success: "bg-jamogo-green-500",
  danger: "bg-jamogo-danger",
  info: "bg-jamogo-info",
  neutral: "bg-jamogo-gray-400",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASSES[tone]}`}
      />
      {/* Capitalise the first letter only ("completed" → "Completed", "Shared · 2 bookings" stays). */}
      <span className="inline-block first-letter:uppercase">{children}</span>
    </span>
  );
}
