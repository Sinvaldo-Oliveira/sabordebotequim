import type { Metadata } from "next";
import { Eye, MousePointerClick, Vote, Percent, MapPin, Phone, AtSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { VotesTrendChart, type VotesTrendPoint } from "@/components/charts/votes-trend-chart";
import { computeTrend } from "@/lib/format/trend";
import { ENTITY_STATUS_LABELS, ENTITY_STATUS_VARIANTS } from "@/lib/format/status-labels";

export const metadata: Metadata = { title: "Painel do restaurante" };
export const dynamic = "force-dynamic";

type RestaurantMetrics = {
  total_views: number;
  total_card_clicks: number;
  vote_button_clicks: number;
  vote_form_starts: number;
  whatsapp_clicks: number;
  instagram_clicks: number;
  map_clicks: number;
  views_this_week: number;
  views_previous_week: number;
  clicks_this_week: number;
  clicks_previous_week: number;
  total_votes: number;
  votes_this_week: number;
  votes_previous_week: number;
  daily_votes: { date: string; votes: number }[];
};

export default async function PainelHomePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: restaurant } = profile
    ? await supabase
        .from("restaurants")
        .select("id, name, status, neighborhood, city, category_id, phone, whatsapp, instagram")
        .eq("owner_user_id", profile.id)
        .is("deleted_at", null)
        .maybeSingle()
    : { data: null };

  if (!restaurant) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Visão geral</h1>
        <p className="rounded-lg border border-line bg-surface p-6 text-sm text-muted">
          Nenhum restaurante vinculado a este acesso ainda. Fale com a organização do festival
          para associar seu login ao seu restaurante.
        </p>
      </div>
    );
  }

  const [{ data: metricsData }, { data: category }, { data: dish }] = await Promise.all([
    supabase.rpc("get_restaurant_metrics", { p_restaurant_id: restaurant.id }),
    restaurant.category_id
      ? supabase
          .from("voting_categories")
          .select("name")
          .eq("id", restaurant.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("dishes")
      .select("name")
      .eq("restaurant_id", restaurant.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const m = metricsData as RestaurantMetrics | null;

  const conversionRate =
    m && m.total_card_clicks > 0 ? Math.round((m.total_votes / m.total_card_clicks) * 100) : null;

  const chartData: VotesTrendPoint[] = (m?.daily_votes ?? []).map((point) => ({
    date: point.date,
    label: new Date(point.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    votes: point.votes,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Visão geral</h1>
          <p className="mt-1 text-sm text-muted">{restaurant.name}</p>
        </div>
        <Badge variant={ENTITY_STATUS_VARIANTS[restaurant.status]}>
          {ENTITY_STATUS_LABELS[restaurant.status]}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visualizações do perfil"
          value={m ? m.total_views.toLocaleString("pt-BR") : "—"}
          icon={Eye}
          tone="secondary"
          trend={m ? computeTrend(m.views_this_week, m.views_previous_week) : undefined}
          trendLabel="esta semana"
        />
        <StatCard
          label="Cliques em votar"
          value={m ? m.vote_button_clicks.toLocaleString("pt-BR") : "—"}
          icon={MousePointerClick}
          tone="accent"
          trend={m ? computeTrend(m.clicks_this_week, m.clicks_previous_week) : undefined}
          trendLabel="esta semana"
        />
        <StatCard
          label="Votos recebidos"
          value={m ? m.total_votes.toLocaleString("pt-BR") : "—"}
          icon={Vote}
          tone="leaf"
          trend={m ? computeTrend(m.votes_this_week, m.votes_previous_week) : undefined}
          trendLabel="esta semana"
        />
        <StatCard
          label="Taxa de conversão"
          value={conversionRate !== null ? `${conversionRate}%` : "—"}
          icon={Percent}
          tone="primary"
          caption="De cliques no card para votos confirmados."
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Votos por dia</CardTitle>
            <span className="text-xs text-muted">Últimos 14 dias</span>
          </CardHeader>
          <CardContent>
            <VotesTrendChart data={chartData} gradientId="restaurantVotesFill" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfil do restaurante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {category && (
              <p className="font-semibold text-primary-strong">{category.name}</p>
            )}
            {dish && (
              <p className="text-ink">
                Prato do festival: <span className="font-semibold">{dish.name}</span>
              </p>
            )}
            {restaurant.neighborhood && (
              <p className="flex items-center gap-1.5 text-muted">
                <MapPin aria-hidden="true" className="size-4" />
                {restaurant.neighborhood}, {restaurant.city}
              </p>
            )}
            {restaurant.phone && (
              <p className="flex items-center gap-1.5 text-muted">
                <Phone aria-hidden="true" className="size-4" />
                {restaurant.phone}
              </p>
            )}
            {restaurant.instagram && (
              <p className="flex items-center gap-1.5 text-muted">
                <AtSign aria-hidden="true" className="size-4" />
                {restaurant.instagram}
              </p>
            )}
            <p className="pt-2 text-xs text-muted">
              A edição do perfil, prato e galeria chega em breve nesta área.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
