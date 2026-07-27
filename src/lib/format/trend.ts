export type Trend = {
  direction: "up" | "down" | "flat";
  percent: number | null;
};

/** Compara duas contagens (período atual vs. anterior) e calcula a variação. */
export function computeTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    if (current === 0) return { direction: "flat", percent: null };
    return { direction: "up", percent: null };
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 1) return { direction: "flat", percent: 0 };
  return { direction: change > 0 ? "up" : "down", percent: Math.round(Math.abs(change)) };
}
