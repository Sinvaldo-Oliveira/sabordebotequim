"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAdminRole } from "@/lib/auth/roles";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadMediaResult = { url: string } | { error: string };

/**
 * Upload de imagem do restaurante via Server Action (sessão lida por
 * cookies no servidor — o mesmo mecanismo já usado em todo o resto do
 * projeto). Evita depender da sincronização de sessão do cliente do
 * navegador, que é a única gravação que ainda dependia dela.
 */
export async function uploadRestaurantMedia(formData: FormData): Promise<UploadMediaResult> {
  const file = formData.get("file");
  const restaurantId = formData.get("restaurantId");
  const purpose = formData.get("purpose");

  if (!(file instanceof File) || typeof restaurantId !== "string" || typeof purpose !== "string") {
    return { error: "Requisição inválida." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Envie uma imagem JPG, PNG ou WebP." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "A imagem deve ter até 5 MB." };
  }

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sessão expirada. Faça login novamente." };

  const supabase = await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_user_id")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant || (restaurant.owner_user_id !== profile.id && !isAdminRole(profile.role))) {
    return { error: "Você não tem permissão para editar este restaurante." };
  }

  const safePurpose = purpose.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "media";
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  // Nome do arquivo já é único (timestamp) — upsert não é necessário e,
  // por um efeito colateral do caminho ON CONFLICT DO UPDATE do Storage,
  // acaba sendo bloqueado pela policy de UPDATE mesmo sem conflito real.
  const path = `restaurants/${restaurant.id}/${safePurpose}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("restaurant-media")
    .upload(path, file, { cacheControl: "3600", contentType: file.type });

  if (uploadError) {
    return { error: "Não foi possível enviar a imagem. Tente novamente." };
  }

  const { data } = supabase.storage.from("restaurant-media").getPublicUrl(path);
  return { url: data.publicUrl };
}
