"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAdminRole } from "@/lib/auth/roles";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadMediaResult = { url: string } | { error: string };

/** Upload de imagem do festival (carrossel etc.) — só administradores. */
export async function uploadFestivalMedia(formData: FormData): Promise<UploadMediaResult> {
  const file = formData.get("file");
  const purpose = formData.get("purpose");

  if (!(file instanceof File) || typeof purpose !== "string") {
    return { error: "Requisição inválida." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Envie uma imagem JPG, PNG ou WebP." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "A imagem deve ter até 5 MB." };
  }

  const profile = await getCurrentProfile();
  if (!profile || !isAdminRole(profile.role)) {
    return { error: "Acesso não autorizado." };
  }

  const supabase = await createClient();
  const safePurpose = purpose.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "media";
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${safePurpose}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("festival-media")
    .upload(path, file, { cacheControl: "3600", contentType: file.type });

  if (uploadError) {
    return { error: "Não foi possível enviar a imagem. Tente novamente." };
  }

  const { data } = supabase.storage.from("festival-media").getPublicUrl(path);
  return { url: data.publicUrl };
}
