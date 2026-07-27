import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentFestival } from "@/lib/festival";

// Eventos de analytics disparados pelo cliente (cliques, aberturas de modal).
// Lista fechada para evitar poluição/abuso da tabela.
const ALLOWED_EVENTS = new Set([
  "vote_button_click",
  "vote_modal_open",
  "vote_form_start",
  "vote_form_abandon",
  "restaurant_profile_view",
  "restaurant_card_click",
  "share_click",
]);

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    event?: string;
    restaurantId?: string | null;
  } | null;

  if (!body?.event || !ALLOWED_EVENTS.has(body.event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const festival = await getCurrentFestival();
    const admin = createAdminClient();
    await admin.from("analytics_events").insert({
      event_name: body.event,
      festival_id: festival?.id ?? null,
      restaurant_id: body.restaurantId ?? null,
    });
  } catch {
    // Silencioso: analytics nunca deve impactar a experiência.
  }

  return NextResponse.json({ ok: true });
}
