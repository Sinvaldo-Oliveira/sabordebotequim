import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { FestivalSettingsForm } from "@/components/admin/festival-settings-form";
import { VoteCountsVisibilityForm } from "@/components/admin/vote-counts-visibility-form";
import { WhatsAppMetrics } from "@/components/admin/whatsapp-metrics";
import { toDatetimeLocalValue } from "@/lib/utils/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Configuração da votação" };
export const dynamic = "force-dynamic";

export default async function AdminVotingSettingsPage() {
  const festival = await getCurrentFestival();

  if (!festival) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Configuração da votação</h1>
        <p className="text-sm text-muted">Nenhum festival configurado ainda.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("system_settings")
    .select("setting_value")
    .eq("festival_id", festival.id)
    .eq("setting_key", "public_show_vote_counts")
    .maybeSingle();
  const voteCountsEnabled =
    (setting?.setting_value as { enabled?: boolean } | null)?.enabled !== false;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Configuração da votação</h1>
          <p className="mt-1 text-sm text-muted">
            A identificação do voto é feita por <strong>WhatsApp</strong> (1 voto por número
            por edição). Abra, pause ou encerre a votação e defina a janela de datas abaixo.
          </p>
        </div>
      </div>

      <FestivalSettingsForm
        festivalId={festival.id}
        defaultValues={{
          name: festival.name,
          description: festival.description ?? "",
          status: festival.status,
          voting_start_at: toDatetimeLocalValue(festival.voting_start_at),
          voting_end_at: toDatetimeLocalValue(festival.voting_end_at),
        }}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resultados na home</CardTitle>
        </CardHeader>
        <CardContent>
          <VoteCountsVisibilityForm festivalId={festival.id} enabled={voteCountsEnabled} />
        </CardContent>
      </Card>

      <WhatsAppMetrics festivalId={festival.id} />
    </div>
  );
}
