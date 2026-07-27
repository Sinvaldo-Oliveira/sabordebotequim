"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveFounderSection } from "@/actions/festival-settings";
import { founderSectionSchema, type FounderSectionInput } from "@/lib/validators/founder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function FounderSectionForm({
  festivalId,
  defaultValues,
}: {
  festivalId: string;
  defaultValues: FounderSectionInput;
}) {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FounderSectionInput>({
    resolver: zodResolver(founderSectionSchema),
    defaultValues,
  });

  const onSubmit = (values: FounderSectionInput) => {
    setServerError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveFounderSection(festivalId, values);
      if ("error" in result) setServerError(result.error);
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      {saved && <Alert variant="success">Textos salvos.</Alert>}

      <div>
        <Label htmlFor="eyebrow">Texto de destaque</Label>
        <Input id="eyebrow" aria-invalid={Boolean(errors.eyebrow)} {...register("eyebrow")} />
        <p className="mt-1 text-xs text-muted">Pequeno texto acima do título, ex.: "Fale com a organização".</p>
        <FieldError message={errors.eyebrow?.message} />
      </div>

      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" aria-invalid={Boolean(errors.title)} {...register("title")} />
        <FieldError message={errors.title?.message} />
      </div>

      <div>
        <Label htmlFor="body">Texto</Label>
        <Textarea id="body" rows={6} aria-invalid={Boolean(errors.body)} {...register("body")} />
        <FieldError message={errors.body?.message} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Salvando…" : "Salvar textos"}
      </Button>
    </form>
  );
}
