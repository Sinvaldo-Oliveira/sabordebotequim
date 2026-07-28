import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";

export const metadata: Metadata = { title: "Ranking-Votação" };
export const dynamic = "force-dynamic";

export default async function VotingRankingPage() {
  const festival = await getCurrentFestival();

  if (!festival) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Ranking-Votação</h1>
        <p className="text-sm text-muted">Nenhum festival configurado ainda.</p>
      </div>
    );
  }

  const supabase = await createClient();

  // A RPC devolve os valores reais para administradores (o toggle de
  // visibilidade pública não afeta este relatório) e conta apenas votos
  // confirmados por WhatsApp — a mesma regra do indicador "Votos confirmados".
  const [{ data: voteCounts }, { data: restaurants }] = await Promise.all([
    supabase.rpc("get_public_vote_counts", { p_festival_id: festival.id }),
    supabase
      .from("restaurants")
      .select("id, name")
      .eq("festival_id", festival.id)
      .is("deleted_at", null),
  ]);

  const nameById = new Map((restaurants ?? []).map((r) => [r.id, r.name]));

  const ranking = (voteCounts ?? [])
    .filter((row) => nameById.has(row.restaurant_id))
    .map((row) => ({
      id: row.restaurant_id,
      name: nameById.get(row.restaurant_id) ?? "—",
      votes: row.votes_count,
    }))
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, "pt-BR"));

  const totalVotes = ranking.reduce((sum, row) => sum + row.votes, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Ranking-Votação</h1>
        <p className="mt-1 text-sm text-muted">
          Estabelecimentos ordenados do mais votado para o menos votado. Considera apenas
          votos válidos confirmados por WhatsApp. Total apurado:{" "}
          <strong className="text-ink">{totalVotes.toLocaleString("pt-BR")}</strong> voto(s).
        </p>
      </div>

      {ranking.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Nenhum restaurante cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="w-16 px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Nome do estabelecimento</th>
                <th className="px-4 py-3 text-right font-semibold">Nº de Votos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((row, index) => (
                <tr key={row.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-bold text-muted">
                    {index < 3 && row.votes > 0 ? (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <Trophy aria-hidden="true" className="size-4" />
                        {index + 1}
                      </span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-ink">
                    {row.votes.toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
