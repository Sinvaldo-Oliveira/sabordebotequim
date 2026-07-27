"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  restaurantProfileSchema,
  type RestaurantProfileInput,
} from "@/lib/validators/restaurant-profile";
import { z } from "zod";
import type { Json } from "@/types/database.types";

type RestaurantProfileData = z.output<typeof restaurantProfileSchema>;

export type ProfileSubmitResult =
  | { error: string }
  | { status: "published" }
  | { status: "pending" };

function emptyToNull(value: string | undefined | null) {
  return value && value.trim() !== "" ? value : null;
}

/** true quando o festival exige aprovação do admin para editar o restaurante. */
async function requiresApproval(
  supabase: Awaited<ReturnType<typeof createClient>>,
  festivalId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("system_settings")
    .select("setting_value")
    .eq("festival_id", festivalId)
    .eq("setting_key", "restaurant_edits_require_approval")
    .maybeSingle();

  const value = data?.setting_value as { enabled?: boolean } | null;
  return value?.enabled === true;
}

function buildRestaurantPatch(data: RestaurantProfileData) {
  return {
    short_description: emptyToNull(data.short_description),
    description: emptyToNull(data.description),
    story: emptyToNull(data.story),
    phone: emptyToNull(data.phone),
    whatsapp: emptyToNull(data.whatsapp),
    email: emptyToNull(data.email),
    website: emptyToNull(data.website),
    instagram: emptyToNull(data.instagram),
    facebook: emptyToNull(data.facebook),
    tiktok: emptyToNull(data.tiktok),
    address: emptyToNull(data.address),
    number: emptyToNull(data.number),
    complement: emptyToNull(data.complement),
    neighborhood: emptyToNull(data.neighborhood),
    postal_code: emptyToNull(data.postal_code),
    logo_url: data.logo_url || null,
    banner_url: data.banner_url || null,
    opening_hours: data.opening_hours,
  };
}

export async function submitRestaurantProfile(
  input: RestaurantProfileInput,
): Promise<ProfileSubmitResult> {
  const parsed = restaurantProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Verifique os campos do formulário." };
  }
  const data = parsed.data;

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sessão expirada. Faça login novamente." };

  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_user_id", profile.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!restaurant) return { error: "Nenhum restaurante vinculado a este acesso." };

  const { data: existingDish } = await supabase
    .from("dishes")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const restaurantPatch = buildRestaurantPatch(data);
  const dishPatch = {
    name: data.dish_name || "Prato do festival",
    description: emptyToNull(data.dish_description),
    ingredients: emptyToNull(data.dish_ingredients),
    dietary_information: emptyToNull(data.dish_dietary_information),
    price: data.dish_price ?? null,
    main_image_url: data.dish_main_image_url || null,
  };

  const needsApproval = await requiresApproval(supabase, restaurant.festival_id);

  if (!needsApproval) {
    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update(restaurantPatch)
      .eq("id", restaurant.id);
    if (restaurantError) return { error: "Não foi possível salvar as alterações." };

    if (existingDish) {
      await supabase.from("dishes").update(dishPatch).eq("id", existingDish.id);
    } else if (data.dish_name) {
      await supabase.from("dishes").insert({ restaurant_id: restaurant.id, ...dishPatch });
    }

    revalidatePath("/painel-restaurante/perfil");
    revalidatePath("/painel-restaurante");
    return { status: "published" };
  }

  const { error: requestError } = await supabase.from("restaurant_change_requests").insert({
    restaurant_id: restaurant.id,
    requested_by: profile.id,
    current_data: {
      restaurant: restaurantSnapshot(restaurant),
      dish: existingDish ?? null,
    } as unknown as Json,
    requested_data: { restaurant: restaurantPatch, dish: dishPatch } as unknown as Json,
    status: "pending",
  });

  if (requestError) return { error: "Não foi possível enviar a solicitação de alteração." };

  revalidatePath("/painel-restaurante/perfil");
  return { status: "pending" };
}

function restaurantSnapshot(restaurant: Record<string, unknown>) {
  const {
    short_description,
    description,
    story,
    phone,
    whatsapp,
    email,
    website,
    instagram,
    facebook,
    tiktok,
    address,
    number,
    complement,
    neighborhood,
    postal_code,
    logo_url,
    banner_url,
    opening_hours,
  } = restaurant;
  return {
    short_description,
    description,
    story,
    phone,
    whatsapp,
    email,
    website,
    instagram,
    facebook,
    tiktok,
    address,
    number,
    complement,
    neighborhood,
    postal_code,
    logo_url,
    banner_url,
    opening_hours,
  };
}
