"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { restaurantSchema, type RestaurantInput } from "@/lib/validators/restaurant";
import type { EntityStatus } from "@/types/database.types";

export type RestaurantActionResult = { error: string } | undefined;

function emptyToNull(value: string | undefined | null) {
  return value && value.trim() !== "" ? value : null;
}

export async function createRestaurant(
  input: RestaurantInput,
): Promise<RestaurantActionResult> {
  const parsed = restaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Verifique os campos do formulário." };
  }
  const data = parsed.data;

  const festival = await getCurrentFestival();
  if (!festival) {
    return { error: "Nenhum festival configurado ainda." };
  }

  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from("restaurants")
    .insert({
      festival_id: festival.id,
      name: data.name,
      slug: data.slug,
      category_id: data.category_id || null,
      logo_url: data.logo_url || null,
      card_image_url: data.card_image_url || null,
      banner_url: data.banner_url || null,
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
      city: data.city,
      state: data.state,
      postal_code: emptyToNull(data.postal_code),
      status: data.status,
      is_featured: data.is_featured,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um restaurante com este endereço (slug)." };
    }
    return { error: "Não foi possível criar o restaurante." };
  }

  revalidatePath("/admin/restaurantes");
  redirect(`/admin/restaurantes/${created.id}`);
}

export async function updateRestaurant(
  id: string,
  input: RestaurantInput,
): Promise<RestaurantActionResult> {
  const parsed = restaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Verifique os campos do formulário." };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase
    .from("restaurants")
    .update({
      name: data.name,
      slug: data.slug,
      category_id: data.category_id || null,
      logo_url: data.logo_url || null,
      card_image_url: data.card_image_url || null,
      banner_url: data.banner_url || null,
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
      city: data.city,
      state: data.state,
      postal_code: emptyToNull(data.postal_code),
      status: data.status,
      is_featured: data.is_featured,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um restaurante com este endereço (slug)." };
    }
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/admin/restaurantes");
  revalidatePath(`/admin/restaurantes/${id}`);
  return undefined;
}

export async function setRestaurantStatus(id: string, status: EntityStatus) {
  const supabase = await createClient();
  await supabase.from("restaurants").update({ status }).eq("id", id);
  revalidatePath("/admin/restaurantes");
}

export async function softDeleteRestaurant(id: string) {
  const supabase = await createClient();
  await supabase
    .from("restaurants")
    .update({ status: "inactive", deleted_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/restaurantes");
}
