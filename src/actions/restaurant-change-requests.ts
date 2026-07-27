"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import type { Database } from "@/types/database.types";

type RestaurantPatch = Database["public"]["Tables"]["restaurants"]["Update"];
type DishPatch = Database["public"]["Tables"]["dishes"]["Update"] | null;

export async function setRestaurantApprovalRequirement(festivalId: string, enabled: boolean) {
  const supabase = await createClient();
  await supabase.from("system_settings").upsert(
    {
      festival_id: festivalId,
      setting_key: "restaurant_edits_require_approval",
      setting_value: { enabled },
    },
    { onConflict: "festival_id,setting_key" },
  );
  revalidatePath("/admin/restaurantes");
}

export async function approveChangeRequest(requestId: number) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: request } = await supabase
    .from("restaurant_change_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (!request || request.status !== "pending") return;

  const requested = request.requested_data as { restaurant: RestaurantPatch; dish: DishPatch };

  await supabase.from("restaurants").update(requested.restaurant).eq("id", request.restaurant_id);

  if (requested.dish) {
    const { data: existingDish } = await supabase
      .from("dishes")
      .select("id")
      .eq("restaurant_id", request.restaurant_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingDish) {
      await supabase.from("dishes").update(requested.dish).eq("id", existingDish.id);
    } else {
      await supabase.from("dishes").insert({
        restaurant_id: request.restaurant_id,
        ...requested.dish,
      } as Database["public"]["Tables"]["dishes"]["Insert"]);
    }
  }

  await supabase
    .from("restaurant_change_requests")
    .update({
      status: "approved",
      reviewed_by: profile?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  revalidatePath("/admin/restaurantes");
}

export async function rejectChangeRequest(requestId: number, notes?: string) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  await supabase
    .from("restaurant_change_requests")
    .update({
      status: "rejected",
      reviewed_by: profile?.id ?? null,
      reviewed_at: new Date().toISOString(),
      review_notes: notes ?? null,
    })
    .eq("id", requestId)
    .eq("status", "pending");

  revalidatePath("/admin/restaurantes");
}
