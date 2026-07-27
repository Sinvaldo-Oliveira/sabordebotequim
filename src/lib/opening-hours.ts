export const WEEKDAYS = [
  { key: "mon", label: "Segunda" },
  { key: "tue", label: "Terça" },
  { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" },
  { key: "fri", label: "Sexta" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]["key"];

export type DayHours = { closed: boolean; open: string; close: string };
export type OpeningHours = Record<WeekdayKey, DayHours>;

export const DEFAULT_OPENING_HOURS: OpeningHours = WEEKDAYS.reduce((acc, day) => {
  acc[day.key] = { closed: day.key === "mon", open: "18:00", close: "23:00" };
  return acc;
}, {} as OpeningHours);

/** Normaliza o jsonb salvo no banco (pode vir vazio/parcial) com os defaults. */
export function normalizeOpeningHours(value: unknown): OpeningHours {
  const raw = (value ?? {}) as Partial<OpeningHours>;
  return WEEKDAYS.reduce((acc, day) => {
    const saved = raw[day.key];
    acc[day.key] = {
      closed: saved?.closed ?? DEFAULT_OPENING_HOURS[day.key].closed,
      open: saved?.open ?? DEFAULT_OPENING_HOURS[day.key].open,
      close: saved?.close ?? DEFAULT_OPENING_HOURS[day.key].close,
    };
    return acc;
  }, {} as OpeningHours);
}
