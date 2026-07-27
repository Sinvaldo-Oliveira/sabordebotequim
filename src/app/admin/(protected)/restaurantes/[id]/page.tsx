import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { RestaurantForm } from "@/components/admin/restaurant-form";

export const metadata: Metadata = { title: "Editar restaurante" };

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const festival = await getCurrentFestival();

  const [{ data: restaurant }, { data: categories }] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).single(),
    festival
      ? supabase
          .from("voting_categories")
          .select("id, name")
          .eq("festival_id", festival.id)
          .order("display_order")
      : Promise.resolve({ data: [] }),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/restaurantes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Voltar para restaurantes
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-ink">Editar restaurante</h1>
      <RestaurantForm
        restaurantId={restaurant.id}
        categories={categories ?? []}
        defaultValues={{
          name: restaurant.name,
          slug: restaurant.slug,
          category_id: restaurant.category_id,
          logo_url: restaurant.logo_url,
          card_image_url: restaurant.card_image_url,
          banner_url: restaurant.banner_url,
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
          city: restaurant.city,
          state: restaurant.state,
          postal_code: restaurant.postal_code ?? "",
          status: restaurant.status,
          is_featured: restaurant.is_featured,
        }}
      />
    </div>
  );
}
