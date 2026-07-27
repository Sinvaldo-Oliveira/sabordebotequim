import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { RestaurantForm } from "@/components/admin/restaurant-form";

export const metadata: Metadata = { title: "Novo restaurante" };

export default async function NewRestaurantPage() {
  const festival = await getCurrentFestival();
  const supabase = await createClient();

  const { data: categories } = festival
    ? await supabase
        .from("voting_categories")
        .select("id, name")
        .eq("festival_id", festival.id)
        .order("display_order")
    : { data: [] };

  return (
    <div>
      <Link
        href="/admin/restaurantes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Voltar para restaurantes
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-ink">Novo restaurante</h1>
      <RestaurantForm categories={categories ?? []} />
    </div>
  );
}
