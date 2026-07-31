export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-jamogo-gray-200 bg-white p-6 ${className}`}
    >
      {children}
    </div>
  );
}
