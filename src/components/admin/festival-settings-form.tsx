"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateFestivalSettings } from "@/actions/festival-settings";
import {
  festivalSettingsSchema,
  type FestivalSettingsInput,
} from "@/lib/validators/festival-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { FESTIVAL_STATUS_LABELS } from "@/lib/format/status-labels";

export function FestivalSettingsForm({
  festivalId,
  defaultValues,
}: {
  festivalId: string;
  defaultValues: FestivalSettingsInput;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successAt, setSuccessAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FestivalSettingsInput>({
    resolver: zodResolver(festivalSettingsSchema),
    defaultValues,
  });

  const onSubmit = (values: FestivalSettingsInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateFestivalSettings(festivalId, values);
      if ("error" in result) {
        setServerError(result.error);
      } else {
        setSuccessAt(Date.now());
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-5">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      {successAt && <Alert variant="success">Configurações da votação salvas.</Alert>}

      <div>
        <Label htmlFor="name">Nome do festival</Label>
        <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div>
        <Label htmlFor="status">Status da votação</Label>
        <Select id="status" {...register("status")}>
          {Object.entries(FESTIVAL_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs text-muted">
          Só é possível registrar votos quando o status é <strong>Ativo</strong> (ou{" "}
          <strong>Pausado</strong>, que bloqueia novos votos temporariamente).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="voting_start_at">Início da votação</Label>
          <Input id="voting_start_at" type="datetime-local" {...register("voting_start_at")} />
        </div>
        <div>
          <Label htmlFor="voting_end_at">Encerramento da votação</Label>
          <Input id="voting_end_at" type="datetime-local" {...register("voting_end_at")} />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
