import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Editar categoria" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("voting_categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/categorias"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Voltar para categorias
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-ink">Editar categoria</h1>
      <CategoryForm
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          voting_rule: category.voting_rule,
          period_hours: category.period_hours,
          status: category.status,
          display_order: category.display_order,
        }}
      />
    </div>
  );
}
