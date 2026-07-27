"use client";

/** Dispara um evento de analytics do lado do cliente (não bloqueia a UI). */
export function trackEvent(event: string, restaurantId?: string) {
  try {
    void fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, restaurantId: restaurantId ?? null }),
      keepalive: true,
    });
  } catch {
    // Silencioso.
  }
}
