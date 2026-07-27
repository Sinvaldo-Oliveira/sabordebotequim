"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import {
  sponsorSchema,
  sponsorsCarouselSettingsSchema,
  type SponsorInput,
  type SponsorsCarouselSettingsInput,
} from "@/lib/validators/sponsor";
import type { EntityStatus } from "@/types/database.types";

export type SponsorResult = { error: string } | { success: true };

function emptyToNull(value: string | undefined | null) {
  return value && value.trim() !== "" ? value : null;
}

function revalidate() {
  revalidatePath("/admin/configuracoes/carrossel-patrocinadores");
  revalidatePath("/");
}

export async function createSponsor(input: SponsorInput): Promise<SponsorResult> {
  const parsed = sponsorSchema.safeParse(input);
  if (!parsed.success) return { error: "Verifique os campos do patrocinador." };
  const data = parsed.data;

  const festival = await getCurrentFestival();
  if (!festival) return { error: "Nenhum festival configurado ainda." };

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("sponsors")
    .select("display_order")
    .eq("festival_id", festival.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("sponsors").insert({
    festival_id: festival.id,
    name: data.name,
    logo_url: data.logo_url,
    website_url: emptyToNull(data.website_url),
    sponsorship_level: emptyToNull(data.sponsorship_level),
    status: data.status,
    display_order: (last?.display_order ?? -1) + 1,
  });

  if (error) return { error: "Não foi possível criar o patrocinador." };
  revalidate();
  return { success: true };
}

export async function updateSponsor(id: number, input: SponsorInput): Promise<SponsorResult> {
  const parsed = sponsorSchema.safeParse(input);
  if (!parsed.success) return { error: "Verifique os campos do patrocinador." };
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("sponsors")
    .update({
      name: data.name,
      logo_url: data.logo_url,
      website_url: emptyToNull(data.website_url),
      sponsorship_level: emptyToNull(data.sponsorship_level),
      status: data.status,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar o patrocinador." };
  revalidate();
  return { success: true };
}

export async function deleteSponsor(id: number) {
  const supabase = await createClient();
  await supabase.from("sponsors").delete().eq("id", id);
  revalidate();
}

export async function setSponsorStatus(id: number, status: EntityStatus) {
  const supabase = await createClient();
  await supabase.from("sponsors").update({ status }).eq("id", id);
  revalidate();
}

/** Move um patrocinador uma posição para cima/baixo trocando o display_order. */
export async function moveSponsor(id: number, direction: "up" | "down") {
  const festival = await getCurrentFestival();
  if (!festival) return;
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("sponsors")
    .select("id, display_order")
    .eq("festival_id", festival.id)
    .order("display_order");

  if (!rows) return;
  const index = rows.findIndex((s) => s.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) return;

  const current = rows[index];
  const swap = rows[swapIndex];
  if (!current || !swap) return;

  await Promise.all([
    supabase.from("sponsors").update({ display_order: swap.display_order }).eq("id", current.id),
    supabase.from("sponsors").update({ display_order: current.display_order }).eq("id", swap.id),
  ]);
  revalidate();
}

export async function saveSponsorsCarouselSettings(
  input: SponsorsCarouselSettingsInput,
): Promise<SponsorResult> {
  const parsed = sponsorsCarouselSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: "Verifique as configurações." };

  const festival = await getCurrentFestival();
  if (!festival) return { error: "Nenhum festival configurado ainda." };

  const supabase = await createClient();
  const { error } = await supabase.from("system_settings").upsert(
    {
      festival_id: festival.id,
      setting_key: "public_sponsors_carousel",
      setting_value: parsed.data,
    },
    { onConflict: "festival_id,setting_key" },
  );

  if (error) return { error: "Não foi possível salvar as configurações." };
  revalidate();
  return { success: true };
}
