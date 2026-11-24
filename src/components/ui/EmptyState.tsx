import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-jamogo-gray-300 bg-card px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jamogo-gray-100 text-jamogo-gray-500">
        <Icon size={24} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-jamogo-ink-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-jamogo-gray-500">{description}</p>
      )}
    </div>
  );
}
