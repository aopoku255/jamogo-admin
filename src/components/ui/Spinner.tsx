export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`h-5 w-5 animate-spin rounded-full border-2 border-jamogo-gray-300 border-t-jamogo-green-500 ${className}`}
    />
  );
}
