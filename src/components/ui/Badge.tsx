type BadgeTone = "warning" | "success" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  warning: "bg-jamogo-warning/15 text-jamogo-warning",
  success: "bg-jamogo-green-100 text-jamogo-green-600",
  danger: "bg-jamogo-danger/15 text-jamogo-danger",
  info: "bg-jamogo-info/15 text-jamogo-info",
  neutral: "bg-jamogo-gray-100 text-jamogo-gray-500",
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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
