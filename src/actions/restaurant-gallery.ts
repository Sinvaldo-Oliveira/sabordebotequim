"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * A galeria é tratada fora do fluxo de aprovação: são fotos
 * complementares, não os campos de identidade do restaurante — cada
 * adição/remoção é gravada imediatamente (RLS já restringe ao dono).
 */
export async function addGalleryImage(restaurantId: string, imageUrl: string) {
  const supabase = await createClient();
  await supabase.from("restaurant_gallery").insert({
    restaurant_id: restaurantId,
    image_url: imageUrl,
  });
  revalidatePath("/painel-restaurante/perfil");
}

export async function removeGalleryImage(id: number) {
  const supabase = await createClient();
  await supabase.from("restaurant_gallery").delete().eq("id", id);
  revalidatePath("/painel-restaurante/perfil");
}
