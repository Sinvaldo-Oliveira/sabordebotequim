"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVotingCategory, updateVotingCategory } from "@/actions/voting-categories";
import {
  votingCategorySchema,
  type VotingCategoryInput,
} from "@/lib/validators/voting-category";
import { slugify } from "@/lib/utils/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { VOTING_RULE_LABELS, CATEGORY_VOTING_RULES } from "@/lib/format/status-labels";

export function CategoryForm({
  categoryId,
  defaultValues,
}: {
  categoryId?: string;
  defaultValues?: Partial<VotingCategoryInput>;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(categoryId));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VotingCategoryInput>({
    resolver: zodResolver(votingCategorySchema),
    defaultValues: {
      voting_rule: "one_per_category",
      status: "active",
      display_order: 0,
      ...defaultValues,
    },
  });

  const votingRule = watch("voting_rule");

  const onSubmit = (values: VotingCategoryInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = categoryId
        ? await updateVotingCategory(categoryId, values)
        : await createVotingCategory(values);
      if (result?.error) setServerError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nome da categoria</Label>
          <Input
            id="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name", {
              onChange: (e) => {
                if (!slugTouched) setValue("slug", slugify(e.target.value));
              },
            })}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="slug">Endereço (slug)</Label>
          <Input
            id="slug"
            aria-invalid={Boolean(errors.slug)}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
          <FieldError message={errors.slug?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div>
        <Label htmlFor="voting_rule">Regra de votação</Label>
        <Select id="voting_rule" {...register("voting_rule")}>
          {CATEGORY_VOTING_RULES.map((value) => (
            <option key={value} value={value}>
              {VOTING_RULE_LABELS[value]}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs text-muted">
          Define quantas vezes o mesmo número de telefone pode votar. Aplicada no banco de
          dados — não pode ser contornada pelo navegador.
        </p>
      </div>

      {votingRule === "one_per_period" && (
        <div>
          <Label htmlFor="period_hours">Intervalo entre votos (horas)</Label>
          <Input
            id="period_hours"
            type="number"
            min={1}
            aria-invalid={Boolean(errors.period_hours)}
            {...register("period_hours")}
          />
          <FieldError message={errors.period_hours?.message} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
            <option value="pending">Pendente</option>
            <option value="suspended">Suspensa</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="display_order">Ordem de exibição</Label>
          <Input id="display_order" type="number" {...register("display_order")} />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Salvando…" : "Salvar categoria"}
      </Button>
    </form>
  );
}
