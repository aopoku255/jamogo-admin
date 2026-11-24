export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-jamogo-gray-200 bg-card p-6 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

/** A card with a title row (title, optional description, optional action on the right). */
export function SectionCard({
  title,
  description,
  action,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col rounded-2xl border border-jamogo-gray-200 bg-card shadow-card ${className}`}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-jamogo-ink-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-jamogo-gray-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 px-6 pb-6">{children}</div>
    </div>
  );
}
