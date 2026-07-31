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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-jamogo-gray-300 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jamogo-gray-100 text-jamogo-gray-500">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-jamogo-ink-900">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-jamogo-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}
