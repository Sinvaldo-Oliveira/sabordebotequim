"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import {
  votingCategorySchema,
  type VotingCategoryInput,
} from "@/lib/validators/voting-category";
import type { EntityStatus } from "@/types/database.types";

export type CategoryActionResult = { error: string } | undefined;

export async function createVotingCategory(
  input: VotingCategoryInput,
): Promise<CategoryActionResult> {
  const parsed = votingCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Verifique os campos do formulário." };
  }
  const data = parsed.data;

  const festival = await getCurrentFestival();
  if (!festival) {
    return { error: "Nenhum festival configurado ainda." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("voting_categories").insert({
    festival_id: festival.id,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    voting_rule: data.voting_rule,
    period_hours: data.voting_rule === "one_per_period" ? data.period_hours : null,
    status: data.status,
    display_order: data.display_order,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe uma categoria com este endereço (slug)." };
    }
    return { error: "Não foi possível criar a categoria." };
  }

  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateVotingCategory(
  id: string,
  input: VotingCategoryInput,
): Promise<CategoryActionResult> {
  const parsed = votingCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Verifique os campos do formulário." };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase
    .from("voting_categories")
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      voting_rule: data.voting_rule,
      period_hours: data.voting_rule === "one_per_period" ? data.period_hours : null,
      status: data.status,
      display_order: data.display_order,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe uma categoria com este endereço (slug)." };
    }
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function setCategoryStatus(id: string, status: EntityStatus) {
  const supabase = await createClient();
  await supabase.from("voting_categories").update({ status }).eq("id", id);
  revalidatePath("/admin/categorias");
}
