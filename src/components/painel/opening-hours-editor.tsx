"use client";

import type { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { WEEKDAYS } from "@/lib/opening-hours";
import type { RestaurantProfileInput } from "@/lib/validators/restaurant-profile";

export function OpeningHoursEditor({
  register,
  watch,
  setValue,
}: {
  register: UseFormRegister<RestaurantProfileInput>;
  watch: UseFormWatch<RestaurantProfileInput>;
  setValue: UseFormSetValue<RestaurantProfileInput>;
}) {
  return (
    <div className="space-y-2">
      {WEEKDAYS.map((day) => {
        const closed = watch(`opening_hours.${day.key}.closed`);
        return (
          <div
            key={day.key}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-line px-3.5 py-2.5"
          >
            <span className="w-20 shrink-0 text-sm font-semibold text-ink">{day.label}</span>
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <input
                type="checkbox"
                className="size-4 accent-[var(--brand-primary)]"
                checked={Boolean(closed)}
                onChange={(e) => setValue(`opening_hours.${day.key}.closed`, e.target.checked)}
              />
              Fechado
            </label>
            {!closed && (
              <div className="flex items-center gap-1.5 text-sm">
                <input
                  type="time"
                  className="rounded-md border border-line px-2 py-1 text-sm"
                  {...register(`opening_hours.${day.key}.open`)}
                />
                <span className="text-muted">às</span>
                <input
                  type="time"
                  className="rounded-md border border-line px-2 py-1 text-sm"
                  {...register(`opening_hours.${day.key}.close`)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
