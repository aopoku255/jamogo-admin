type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-jamogo-green-500 text-white hover:bg-jamogo-green-600",
  secondary:
    "bg-white text-jamogo-ink-900 border border-jamogo-gray-300 hover:border-jamogo-gray-400",
  ghost: "bg-jamogo-green-50 text-jamogo-green-600 hover:bg-jamogo-green-100",
  danger: "bg-jamogo-danger text-white hover:opacity-90",
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
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
