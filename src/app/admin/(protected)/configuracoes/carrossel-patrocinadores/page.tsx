import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SponsorsCarouselSettingsForm } from "@/components/admin/sponsors-carousel-settings-form";
import { SponsorManager, type SponsorRow } from "@/components/admin/sponsor-manager";

export const metadata: Metadata = { title: "Carrossel-Patrocinadores" };
export const dynamic = "force-dynamic";

export default async function SponsorsCarouselPage() {
  const festival = await getCurrentFestival();

  if (!festival) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Carrossel-Patrocinadores</h1>
        <p className="text-sm text-muted">Nenhum festival configurado ainda.</p>
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: sponsors }, { data: setting }] = await Promise.all([
    supabase
      .from("sponsors")
      .select("id, name, logo_url, website_url, sponsorship_level, status")
      .eq("festival_id", festival.id)
      .order("display_order"),
    supabase
      .from("system_settings")
      .select("setting_value")
      .eq("festival_id", festival.id)
      .eq("setting_key", "public_sponsors_carousel")
      .maybeSingle(),
  ]);

  const settings = (setting?.setting_value as {
    enabled?: boolean;
    speed_seconds?: number;
    zoom_scale?: number;
    background_url?: string;
  } | null) ?? {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Carrossel-Patrocinadores</h1>
        <p className="mt-1 text-sm text-muted">
          Logomarcas exibidas em looping na seção &quot;Sobre o festival&quot; da home.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configurações do carrossel</CardTitle>
        </CardHeader>
        <CardContent>
          <SponsorsCarouselSettingsForm
            defaultValues={{
              enabled: settings.enabled !== false,
              speed_seconds: settings.speed_seconds ?? 30,
              zoom_scale: settings.zoom_scale ?? 1.25,
              background_url: settings.background_url ?? "",
            }}
          />
        </CardContent>
      </Card>

      <h2 className="mb-3 text-lg font-bold text-ink">Patrocinadores</h2>
      <SponsorManager sponsors={(sponsors ?? []) as SponsorRow[]} />
    </div>
  );
}
