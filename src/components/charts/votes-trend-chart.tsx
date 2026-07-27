"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type VotesTrendPoint = {
  date: string;
  label: string;
  votes: number;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  const value = payload?.[0]?.value;
  if (!active || value === undefined) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-muted">{value} voto(s)</p>
    </div>
  );
}

export function VotesTrendChart({
  data,
  gradientId = "votesFill",
}: {
  data: VotesTrendPoint[];
  /** Único por página quando houver mais de um gráfico renderizado junto. */
  gradientId?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--brand-line)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--brand-muted)" }}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
          tick={{ fontSize: 12, fill: "var(--brand-muted)" }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--brand-primary)", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="votes"
          stroke="var(--brand-primary)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
