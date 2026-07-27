import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCarouselSettingsForm } from "@/components/admin/hero-carousel-settings-form";
import { HeroSlideManager, type SlideRow } from "@/components/admin/hero-slide-manager";

export const metadata: Metadata = { title: "Slider-Hero" };
export const dynamic = "force-dynamic";

export default async function SliderHeroPage() {
  const festival = await getCurrentFestival();

  if (!festival) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Slider-Hero</h1>
        <p className="text-sm text-muted">Nenhum festival configurado ainda.</p>
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: slides }, { data: setting }] = await Promise.all([
    supabase
      .from("hero_slides")
      .select("id, image_url, title, subtitle, cta_label, cta_href, overlay_opacity, is_active")
      .eq("festival_id", festival.id)
      .order("display_order"),
    supabase
      .from("system_settings")
      .select("setting_value")
      .eq("festival_id", festival.id)
      .eq("setting_key", "public_hero_carousel")
      .maybeSingle(),
  ]);

  const settings = (setting?.setting_value as {
    enabled?: boolean;
    autoplay_seconds?: number;
  } | null) ?? {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Slider-Hero</h1>
        <p className="mt-1 text-sm text-muted">
          Carrossel do topo da home (proporção 1920×1080) com menu transparente sobre a imagem.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configurações do carrossel</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroCarouselSettingsForm
            defaultValues={{
              enabled: settings.enabled !== false,
              autoplay_seconds: settings.autoplay_seconds ?? 6,
            }}
          />
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-bold text-ink">Slides</h2>
      <HeroSlideManager slides={(slides ?? []) as SlideRow[]} />
    </div>
  );
}
