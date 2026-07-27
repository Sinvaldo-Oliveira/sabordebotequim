import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryStatusToggle } from "@/components/admin/category-status-toggle";
import {
  ENTITY_STATUS_LABELS,
  ENTITY_STATUS_VARIANTS,
  VOTING_RULE_LABELS,
} from "@/lib/format/status-labels";

export const metadata: Metadata = { title: "Categorias de votação" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const festival = await getCurrentFestival();
  const supabase = await createClient();

  const { data: categories } = festival
    ? await supabase
        .from("voting_categories")
        .select("*")
        .eq("festival_id", festival.id)
        .order("display_order")
    : { data: null };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Categorias de votação</h1>
          <p className="mt-1 text-sm text-muted">
            {categories?.length ?? 0} categoria(s) configurada(s).
          </p>
        </div>
        <Link href="/admin/categorias/novo" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="size-4" />
          Nova categoria
        </Link>
      </div>

      {!festival && (
        <p className="rounded-lg border border-line bg-surface p-6 text-sm text-muted">
          Nenhum festival configurado ainda.
        </p>
      )}

      {festival && (!categories || categories.length === 0) && (
        <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Nenhuma categoria cadastrada ainda.
        </p>
      )}

      {categories && categories.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Regra de votação</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{category.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {VOTING_RULE_LABELS[category.voting_rule]}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ENTITY_STATUS_VARIANTS[category.status]}>
                      {ENTITY_STATUS_LABELS[category.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/categorias/${category.id}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                        aria-label="Editar categoria"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <CategoryStatusToggle id={category.id} status={category.status} />
                    </div>
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
