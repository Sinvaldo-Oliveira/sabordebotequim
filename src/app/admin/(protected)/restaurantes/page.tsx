import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RestaurantRowActions } from "@/components/admin/restaurant-row-actions";
import { ApprovalToggle } from "@/components/admin/approval-toggle";
import { ChangeRequestCard } from "@/components/admin/change-request-card";
import { ENTITY_STATUS_LABELS, ENTITY_STATUS_VARIANTS } from "@/lib/format/status-labels";

export const metadata: Metadata = { title: "Restaurantes" };
export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  const festival = await getCurrentFestival();
  const supabase = await createClient();

  const { data: restaurants } = festival
    ? await supabase
        .from("restaurants")
        .select("id, name, neighborhood, status, is_featured, category_id")
        .eq("festival_id", festival.id)
        .is("deleted_at", null)
        .order("display_order")
    : { data: null };

  const { data: categories } = festival
    ? await supabase.from("voting_categories").select("id, name").eq("festival_id", festival.id)
    : { data: null };

  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const { data: approvalSetting } = festival
    ? await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("festival_id", festival.id)
        .eq("setting_key", "restaurant_edits_require_approval")
        .maybeSingle()
    : { data: null };
  const approvalEnabled =
    (approvalSetting?.setting_value as { enabled?: boolean } | null)?.enabled === true;

  const restaurantIds = (restaurants ?? []).map((r) => r.id);
  const { data: pendingRequests } =
    restaurantIds.length > 0
      ? await supabase
          .from("restaurant_change_requests")
          .select("id, restaurant_id, current_data, requested_data, created_at")
          .in("restaurant_id", restaurantIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      : { data: [] };

  const restaurantNameById = new Map((restaurants ?? []).map((r) => [r.id, r.name]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Restaurantes</h1>
          <p className="mt-1 text-sm text-muted">
            {restaurants?.length ?? 0} restaurante(s) cadastrado(s).
          </p>
        </div>
        <Link href="/admin/restaurantes/novo" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="size-4" />
          Novo restaurante
        </Link>
      </div>

      {festival && (
        <div className="mb-6">
          <ApprovalToggle festivalId={festival.id} enabled={approvalEnabled} />
        </div>
      )}

      {pendingRequests && pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-ink">
            Alterações pendentes ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <ChangeRequestCard
                key={request.id}
                request={{
                  id: request.id,
                  restaurantName: restaurantNameById.get(request.restaurant_id) ?? "Restaurante",
                  createdAt: request.created_at,
                  currentData: request.current_data as never,
                  requestedData: request.requested_data as never,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {!festival && (
        <p className="rounded-lg border border-line bg-surface p-6 text-sm text-muted">
          Nenhum festival configurado ainda.
        </p>
      )}

      {festival && (!restaurants || restaurants.length === 0) && (
        <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Nenhum restaurante cadastrado ainda. Clique em &quot;Novo restaurante&quot; para
          começar.
        </p>
      )}

      {restaurants && restaurants.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Bairro</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">
                    <span className="inline-flex items-center gap-1.5">
                      {restaurant.is_featured && (
                        <Star className="size-3.5 fill-accent text-accent" />
                      )}
                      {restaurant.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {(restaurant.category_id && categoryNameById.get(restaurant.category_id)) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{restaurant.neighborhood ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ENTITY_STATUS_VARIANTS[restaurant.status]}>
                      {ENTITY_STATUS_LABELS[restaurant.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <RestaurantRowActions id={restaurant.id} status={restaurant.status} />
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
