import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { Trend } from "@/lib/format/trend";

const ICON_TONES = {
  primary: "bg-primary text-white",
  leaf: "bg-leaf text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-ink",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  trend,
  trendLabel,
  caption,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: keyof typeof ICON_TONES;
  trend?: Trend;
  trendLabel?: string;
  caption?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-semibold text-muted">{label}</CardTitle>
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            ICON_TONES[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-ink">{value}</p>

        {trend && (
          <span
            className={cn(
              "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              trend.direction === "up" && "bg-success/12 text-success",
              trend.direction === "down" && "bg-error/12 text-error",
              trend.direction === "flat" && "bg-ink/8 text-muted",
            )}
          >
            {trend.direction === "up" && <TrendingUp aria-hidden="true" className="size-3.5" />}
            {trend.direction === "down" && (
              <TrendingDown aria-hidden="true" className="size-3.5" />
            )}
            {trend.direction === "flat" && <Minus aria-hidden="true" className="size-3.5" />}
            {trend.percent !== null ? `${trend.percent}%` : "novo"}
            {trendLabel && <span className="font-normal text-current/80">{trendLabel}</span>}
          </span>
        )}

        {caption && <p className="mt-3 text-xs text-muted">{caption}</p>}
      </CardContent>
    </Card>
  );
}
