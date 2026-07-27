"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

/** Dispara restaurant_profile_view uma vez, ao montar a página do restaurante. */
export function TrackRestaurantView({ restaurantId }: { restaurantId: string }) {
  useEffect(() => {
    trackEvent("restaurant_profile_view", restaurantId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
