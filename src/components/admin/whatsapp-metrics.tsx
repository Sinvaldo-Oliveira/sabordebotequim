import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Metrics = {
  codes_requested: number;
  pending: number;
  used: number;
  expired: number;
  blocked: number;
  votes_valid: number;
};

/** Indicadores do fluxo de votação por WhatsApp (server component). */
export async function WhatsAppMetrics({ festivalId }: { festivalId: string }) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_whatsapp_voting_metrics", {
    p_festival_id: festivalId,
  });
  const m = data as Metrics | null;
  if (!m) return null;

  const conversion =
    m.codes_requested > 0 ? Math.round((m.votes_valid / m.codes_requested) * 100) : 0;

  const cards = [
    { label: "Códigos solicitados", value: m.codes_requested },
    { label: "Verificações pendentes", value: m.pending },
    { label: "Códigos confirmados", value: m.used },
    { label: "Códigos expirados", value: m.expired },
    { label: "Bloqueados por tentativas", value: m.blocked },
    { label: "Votos confirmados", value: m.votes_valid },
  ];

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold text-ink">Votação por WhatsApp</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ink">
                {card.value.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        Conversão de código enviado para voto confirmado: <strong>{conversion}%</strong>
      </p>
    </section>
  );
}
