import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { normalizeOpeningHours } from "@/lib/opening-hours";
import { RestaurantProfileForm } from "@/components/painel/restaurant-profile-form";

export const metadata: Metadata = { title: "Perfil e prato" };
export const dynamic = "force-dynamic";

export default async function RestaurantProfilePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: restaurant } = profile
    ? await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_user_id", profile.id)
        .is("deleted_at", null)
        .maybeSingle()
    : { data: null };

  if (!restaurant) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Perfil e prato</h1>
        <p className="rounded-lg border border-line bg-surface p-6 text-sm text-muted">
          Nenhum restaurante vinculado a este acesso ainda.
        </p>
      </div>
    );
  }

  const [{ data: category }, { data: dish }, { data: gallery }, { data: setting }] =
    await Promise.all([
      restaurant.category_id
        ? supabase.from("voting_categories").select("name").eq("id", restaurant.category_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("dishes")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("restaurant_gallery")
        .select("id, image_url")
        .eq("restaurant_id", restaurant.id)
        .order("display_order"),
      supabase
        .from("system_settings")
        .select("setting_value")
        .eq("festival_id", restaurant.festival_id)
        .eq("setting_key", "restaurant_edits_require_approval")
        .maybeSingle(),
    ]);

  const requiresApproval = (setting?.setting_value as { enabled?: boolean } | null)?.enabled === true;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Perfil e prato</h1>
        <p className="mt-1 text-sm text-muted">
          Edite as informações públicas do seu restaurante e do prato participante.
        </p>
      </div>

      <RestaurantProfileForm
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        categoryName={category?.name ?? null}
        requiresApproval={requiresApproval}
        galleryPhotos={gallery ?? []}
        defaultValues={{
          short_description: restaurant.short_description ?? "",
          description: restaurant.description ?? "",
          story: restaurant.story ?? "",
          phone: restaurant.phone ?? "",
          whatsapp: restaurant.whatsapp ?? "",
          email: restaurant.email ?? "",
          website: restaurant.website ?? "",
          instagram: restaurant.instagram ?? "",
          facebook: restaurant.facebook ?? "",
          tiktok: restaurant.tiktok ?? "",
          address: restaurant.address ?? "",
          number: restaurant.number ?? "",
          complement: restaurant.complement ?? "",
          neighborhood: restaurant.neighborhood ?? "",
          postal_code: restaurant.postal_code ?? "",
          logo_url: restaurant.logo_url,
          banner_url: restaurant.banner_url,
          opening_hours: normalizeOpeningHours(restaurant.opening_hours),
          dish_name: dish?.name ?? "",
          dish_description: dish?.description ?? "",
          dish_ingredients: dish?.ingredients ?? "",
          dish_dietary_information: dish?.dietary_information ?? "",
          dish_price: dish?.price ?? undefined,
          dish_main_image_url: dish?.main_image_url ?? null,
        }}
      />
    </div>
  );
}
