"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import {
  heroSlideSchema,
  heroCarouselSettingsSchema,
  type HeroSlideInput,
  type HeroCarouselSettingsInput,
} from "@/lib/validators/hero-slide";

export type HeroSlideResult = { error: string } | { success: true };

function emptyToNull(value: string | undefined | null) {
  return value && value.trim() !== "" ? value : null;
}

function revalidate() {
  revalidatePath("/admin/configuracoes/slider-hero");
  revalidatePath("/");
}

export async function createHeroSlide(input: HeroSlideInput): Promise<HeroSlideResult> {
  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success) return { error: "Verifique os campos do slide." };
  const data = parsed.data;

  const festival = await getCurrentFestival();
  if (!festival) return { error: "Nenhum festival configurado ainda." };

  const supabase = await createClient();

  // Novo slide vai para o fim da lista.
  const { data: last } = await supabase
    .from("hero_slides")
    .select("display_order")
    .eq("festival_id", festival.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("hero_slides").insert({
    festival_id: festival.id,
    image_url: data.image_url,
    title: emptyToNull(data.title),
    subtitle: emptyToNull(data.subtitle),
    cta_label: emptyToNull(data.cta_label),
    cta_href: emptyToNull(data.cta_href),
    overlay_opacity: data.overlay_opacity,
    is_active: data.is_active,
    display_order: (last?.display_order ?? -1) + 1,
  });

  if (error) return { error: "Não foi possível criar o slide." };
  revalidate();
  return { success: true };
}

export async function updateHeroSlide(id: number, input: HeroSlideInput): Promise<HeroSlideResult> {
  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success) return { error: "Verifique os campos do slide." };
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({
      image_url: data.image_url,
      title: emptyToNull(data.title),
      subtitle: emptyToNull(data.subtitle),
      cta_label: emptyToNull(data.cta_label),
      cta_href: emptyToNull(data.cta_href),
      overlay_opacity: data.overlay_opacity,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar o slide." };
  revalidate();
  return { success: true };
}

export async function deleteHeroSlide(id: number) {
  const supabase = await createClient();
  await supabase.from("hero_slides").delete().eq("id", id);
  revalidate();
}

export async function toggleHeroSlide(id: number, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("hero_slides").update({ is_active: isActive }).eq("id", id);
  revalidate();
}

/** Move um slide uma posição para cima/baixo trocando o display_order. */
export async function moveHeroSlide(id: number, direction: "up" | "down") {
  const festival = await getCurrentFestival();
  if (!festival) return;
  const supabase = await createClient();

  const { data: slides } = await supabase
    .from("hero_slides")
    .select("id, display_order")
    .eq("festival_id", festival.id)
    .order("display_order");

  if (!slides) return;
  const index = slides.findIndex((s) => s.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= slides.length) return;

  const current = slides[index];
  const swap = slides[swapIndex];
  if (!current || !swap) return;

  await Promise.all([
    supabase.from("hero_slides").update({ display_order: swap.display_order }).eq("id", current.id),
    supabase.from("hero_slides").update({ display_order: current.display_order }).eq("id", swap.id),
  ]);
  revalidate();
}

export async function saveHeroCarouselSettings(
  input: HeroCarouselSettingsInput,
): Promise<HeroSlideResult> {
  const parsed = heroCarouselSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: "Verifique as configurações." };

  const festival = await getCurrentFestival();
  if (!festival) return { error: "Nenhum festival configurado ainda." };

  const supabase = await createClient();
  const { error } = await supabase.from("system_settings").upsert(
    {
      festival_id: festival.id,
      setting_key: "public_hero_carousel",
      setting_value: parsed.data,
    },
    { onConflict: "festival_id,setting_key" },
  );

  if (error) return { error: "Não foi possível salvar as configurações." };
  revalidate();
  return { success: true };
}
