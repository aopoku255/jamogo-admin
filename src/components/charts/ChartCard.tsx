import { Card } from "@/components/ui/Card";

export function ChartCard({
  title,
  subtitle,
  stat,
  children,
}: {
  title: string;
  subtitle?: string;
  stat?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-jamogo-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-jamogo-gray-500">{subtitle}</p>}
        </div>
        {stat && (
          <p className="shrink-0 font-heading text-2xl font-bold text-jamogo-ink-900">{stat}</p>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}
