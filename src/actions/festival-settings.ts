"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  festivalSettingsSchema,
  type FestivalSettingsInput,
} from "@/lib/validators/festival-settings";
import { founderSectionSchema, type FounderSectionInput } from "@/lib/validators/founder";

export type FestivalSettingsResult = { error: string } | { success: true };

export async function updateFestivalSettings(
  festivalId: string,
  input: FestivalSettingsInput,
): Promise<FestivalSettingsResult> {
  const parsed = festivalSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Verifique os campos do formulário." };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase
    .from("festivals")
    .update({
      name: data.name,
      description: data.description || null,
      status: data.status,
      voting_start_at: data.voting_start_at
        ? new Date(data.voting_start_at).toISOString()
        : null,
      voting_end_at: data.voting_end_at ? new Date(data.voting_end_at).toISOString() : null,
    })
    .eq("id", festivalId);

  if (error) {
    return { error: "Não foi possível salvar as configurações da votação." };
  }

  revalidatePath("/admin/votacao");
  revalidatePath("/admin");
  return { success: true };
}

export async function saveVoteCountsVisibility(
  festivalId: string,
  enabled: boolean,
): Promise<FestivalSettingsResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("system_settings").upsert(
    {
      festival_id: festivalId,
      setting_key: "public_show_vote_counts",
      setting_value: { enabled },
    },
    { onConflict: "festival_id,setting_key" },
  );

  if (error) {
    return { error: "Não foi possível salvar a configuração." };
  }

  revalidatePath("/admin/votacao");
  revalidatePath("/");
  return { success: true };
}

async function loadFounderSetting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  festivalId: string,
) {
  const { data } = await supabase
    .from("system_settings")
    .select("setting_value")
    .eq("festival_id", festivalId)
    .eq("setting_key", "public_founder_photo")
    .maybeSingle();
  return (data?.setting_value as Record<string, unknown> | null) ?? {};
}

export async function saveFounderPhoto(
  festivalId: string,
  url: string,
): Promise<FestivalSettingsResult> {
  const supabase = await createClient();
  const existing = await loadFounderSetting(supabase, festivalId);

  const { error } = await supabase.from("system_settings").upsert(
    {
      festival_id: festivalId,
      setting_key: "public_founder_photo",
      setting_value: { ...existing, url },
    },
    { onConflict: "festival_id,setting_key" },
  );

  if (error) {
    return { error: "Não foi possível salvar a foto." };
  }

  revalidatePath("/admin/configuracoes/idealizador");
  revalidatePath("/");
  return { success: true };
}

export async function saveFounderSection(
  festivalId: string,
  input: FounderSectionInput,
): Promise<FestivalSettingsResult> {
  const parsed = founderSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Verifique os campos do formulário." };
  }

  const supabase = await createClient();
  const existing = await loadFounderSetting(supabase, festivalId);

  const { error } = await supabase.from("system_settings").upsert(
    {
      festival_id: festivalId,
      setting_key: "public_founder_photo",
      setting_value: { ...existing, ...parsed.data },
    },
    { onConflict: "festival_id,setting_key" },
  );

  if (error) {
    return { error: "Não foi possível salvar os textos." };
  }

  revalidatePath("/admin/configuracoes/idealizador");
  revalidatePath("/");
  return { success: true };
}
