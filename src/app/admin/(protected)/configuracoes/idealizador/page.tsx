import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FounderPhotoForm } from "@/components/admin/founder-photo-form";
import { FounderSectionForm } from "@/components/admin/founder-section-form";

export const metadata: Metadata = { title: "Idealizador" };
export const dynamic = "force-dynamic";

const DEFAULT_EYEBROW = "Fale com a organização";
const DEFAULT_TITLE = "Conheça o Idealizador";
const DEFAULT_BODY =
  "O Festival Sabor de Botequim nasceu para valorizar a gastronomia e fortalecer os empreendedores de Ribeirão das Neves. Ao lado da equipe da GolMinas e de seus apoiadores, o idealizador do festival tem o orgulho de apresentar o melhor da culinária da cidade, promovendo sabor, cultura e desenvolvimento local. Seja bem-vindo!";

export default async function FounderPage() {
  const festival = await getCurrentFestival();

  if (!festival) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Idealizador</h1>
        <p className="text-sm text-muted">Nenhum festival configurado ainda.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("system_settings")
    .select("setting_value")
    .eq("festival_id", festival.id)
    .eq("setting_key", "public_founder_photo")
    .maybeSingle();

  const settingValue = setting?.setting_value as
    | { url?: string; eyebrow?: string; title?: string; body?: string }
    | null;

  const photoUrl = settingValue?.url ?? "";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Idealizador</h1>
        <p className="mt-1 text-sm text-muted">
          Foto e textos exibidos na seção &quot;Fale com a organização&quot; da home.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Foto</CardTitle>
        </CardHeader>
        <CardContent>
          <FounderPhotoForm festivalId={festival.id} photoUrl={photoUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textos</CardTitle>
        </CardHeader>
        <CardContent>
          <FounderSectionForm
            festivalId={festival.id}
            defaultValues={{
              eyebrow: settingValue?.eyebrow ?? DEFAULT_EYEBROW,
              title: settingValue?.title ?? DEFAULT_TITLE,
              body: settingValue?.body ?? DEFAULT_BODY,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
