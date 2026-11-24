type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-jamogo-green-500 text-white shadow-sm hover:bg-jamogo-green-600",
  secondary:
    "bg-card text-jamogo-ink-900 border border-jamogo-gray-300 shadow-sm hover:bg-jamogo-gray-50 hover:border-jamogo-gray-400",
  ghost: "bg-jamogo-green-50 text-jamogo-green-600 hover:bg-jamogo-green-100",
  danger: "bg-jamogo-danger text-white shadow-sm hover:opacity-90",
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-jamogo-green-300 focus-visible:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
