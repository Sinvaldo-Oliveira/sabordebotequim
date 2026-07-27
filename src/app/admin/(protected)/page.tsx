import type { Metadata } from "next";
import Link from "next/link";
import { UtensilsCrossed, Vote, Eye, MousePointerClick, CircleDot } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { VotesTrendChart, type VotesTrendPoint } from "@/components/charts/votes-trend-chart";
import { computeTrend } from "@/lib/format/trend";
import {
  ENTITY_STATUS_LABELS,
  ENTITY_STATUS_VARIANTS,
  FESTIVAL_STATUS_LABELS,
} from "@/lib/format/status-labels";

export const metadata: Metadata = { title: "Visão geral" };
export const dynamic = "force-dynamic";

type DashboardStats = {
  restaurants_total: number;
  restaurants_active: number;
  restaurants_pending: number;
  votes_valid: number;
  votes_under_review: number;
  votes_invalidated: number;
  page_views: number;
  vote_button_clicks: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 14;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminHomePage() {
  const festival = await getCurrentFestival();
  const supabase = await createClient();

  const { data: stats } = festival
    ? await supabase.rpc("get_admin_dashboard_stats", { p_festival_id: festival.id })
    : { data: null };
  const s = stats as DashboardStats | null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS);

  let votesTrend = computeTrend(0, 0);
  let chartData: VotesTrendPoint[] = [];
  let recentRestaurants: {
    id: string;
    name: string;
    status: "active" | "inactive" | "pending" | "suspended";
    category_id: string | null;
    created_at: string;
  }[] = [];
  let newRestaurantsThisWeek = 0;
  let visitsTrend = computeTrend(0, 0);
  let clicksTrend = computeTrend(0, 0);
  let categoryNameById = new Map<string, string>();

  if (festival) {
    const [votesResult, viewsThisWeek, viewsPrevWeek, clicksThisWeek, clicksPrevWeek, restaurantsResult, categoriesResult] =
      await Promise.all([
        supabase
          .from("votes")
          .select("created_at")
          .eq("festival_id", festival.id)
          .eq("status", "valid")
          .gte("created_at", twoWeeksAgo.toISOString()),
        supabase
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .eq("festival_id", festival.id)
          .eq("event_name", "landing_view")
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .eq("festival_id", festival.id)
          .eq("event_name", "landing_view")
          .gte("created_at", twoWeeksAgo.toISOString())
          .lt("created_at", weekAgo.toISOString()),
        supabase
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .eq("festival_id", festival.id)
          .eq("event_name", "vote_button_click")
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .eq("festival_id", festival.id)
          .eq("event_name", "vote_button_click")
          .gte("created_at", twoWeeksAgo.toISOString())
          .lt("created_at", weekAgo.toISOString()),
        supabase
          .from("restaurants")
          .select("id, name, status, category_id, created_at")
          .eq("festival_id", festival.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("voting_categories").select("id, name").eq("festival_id", festival.id),
      ]);

    const votesThisWeekCount = (votesResult.data ?? []).filter(
      (v) => new Date(v.created_at) >= weekAgo,
    ).length;
    const votesPrevWeekCount = (votesResult.data ?? []).filter(
      (v) => new Date(v.created_at) < weekAgo,
    ).length;
    votesTrend = computeTrend(votesThisWeekCount, votesPrevWeekCount);
    visitsTrend = computeTrend(viewsThisWeek.count ?? 0, viewsPrevWeek.count ?? 0);
    clicksTrend = computeTrend(clicksThisWeek.count ?? 0, clicksPrevWeek.count ?? 0);

    recentRestaurants = restaurantsResult.data ?? [];
    newRestaurantsThisWeek = recentRestaurants.filter(
      (r) => new Date(r.created_at) >= weekAgo,
    ).length;
    categoryNameById = new Map((categoriesResult.data ?? []).map((c) => [c.id, c.name]));

    const bucket = new Map<string, number>();
    for (let i = CHART_DAYS - 1; i >= 0; i--) {
      const day = startOfDay(new Date(now.getTime() - i * DAY_MS));
      bucket.set(day.toISOString().slice(0, 10), 0);
    }
    for (const vote of votesResult.data ?? []) {
      const key = startOfDay(new Date(vote.created_at)).toISOString().slice(0, 10);
      if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + 1);
    }
    chartData = Array.from(bucket.entries()).map(([date, votes]) => ({
      date,
      label: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      votes,
    }));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Visão geral</h1>
          <p className="mt-1 text-sm text-muted">
            {festival ? festival.name : "Gerencie o festival e acompanhe a votação em tempo real."}
          </p>
        </div>
        {festival && (
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink">
            <CircleDot
              aria-hidden="true"
              className={
                festival.status === "active" ? "size-3.5 text-success" : "size-3.5 text-muted"
              }
            />
            {FESTIVAL_STATUS_LABELS[festival.status]}
          </span>
        )}
      </div>

      {!festival && (
        <p className="rounded-lg border border-line bg-surface p-6 text-sm text-muted">
          Nenhum festival configurado ainda. Crie um restaurante e configure a votação para
          começar.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Restaurantes"
          value={s ? `${s.restaurants_active} / ${s.restaurants_total}` : "—"}
          icon={UtensilsCrossed}
          tone="primary"
          caption={
            s
              ? `${newRestaurantsThisWeek} novo(s) esta semana · ${s.restaurants_pending} pendente(s)`
              : "Sem festival configurado."
          }
        />
        <StatCard
          label="Votos válidos"
          value={s ? s.votes_valid.toLocaleString("pt-BR") : "—"}
          icon={Vote}
          tone="leaf"
          trend={s ? votesTrend : undefined}
          trendLabel="esta semana"
        />
        <StatCard
          label="Visitas à landing"
          value={s ? s.page_views.toLocaleString("pt-BR") : "—"}
          icon={Eye}
          tone="secondary"
          trend={s ? visitsTrend : undefined}
          trendLabel="esta semana"
        />
        <StatCard
          label="Cliques em votar"
          value={s ? s.vote_button_clicks.toLocaleString("pt-BR") : "—"}
          icon={MousePointerClick}
          tone="accent"
          trend={s ? clicksTrend : undefined}
          trendLabel="esta semana"
        />
      </div>

      {festival && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Votos por dia</CardTitle>
              <span className="text-xs text-muted">Últimos {CHART_DAYS} dias</span>
            </CardHeader>
            <CardContent>
              <VotesTrendChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Restaurantes recentes</CardTitle>
              <Link
                href="/admin/restaurantes/novo"
                className={buttonVariants({ size: "sm", className: "gap-1.5" })}
              >
                Novo
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRestaurants.length === 0 && (
                <p className="text-sm text-muted">Nenhum restaurante cadastrado ainda.</p>
              )}
              {recentRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/admin/restaurantes/${restaurant.id}`}
                  className="flex items-center gap-3 rounded-lg border border-line p-3 transition-colors hover:bg-cream/60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                    {restaurant.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {restaurant.name}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {(restaurant.category_id && categoryNameById.get(restaurant.category_id)) ??
                        "Sem categoria"}
                    </span>
                  </span>
                  <Badge variant={ENTITY_STATUS_VARIANTS[restaurant.status]}>
                    {ENTITY_STATUS_LABELS[restaurant.status]}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
