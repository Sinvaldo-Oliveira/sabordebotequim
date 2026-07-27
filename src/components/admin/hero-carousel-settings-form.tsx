"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveHeroCarouselSettings } from "@/actions/hero-slides";
import {
  heroCarouselSettingsSchema,
  type HeroCarouselSettingsInput,
} from "@/lib/validators/hero-slide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function HeroCarouselSettingsForm({
  defaultValues,
}: {
  defaultValues: HeroCarouselSettingsInput;
}) {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue } = useForm<HeroCarouselSettingsInput>({
    resolver: zodResolver(heroCarouselSettingsSchema),
    defaultValues,
  });

  const enabled = watch("enabled");

  const onSubmit = (values: HeroCarouselSettingsInput) => {
    setServerError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveHeroCarouselSettings(values);
      if ("error" in result) setServerError(result.error);
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      {saved && <Alert variant="success">Configurações do carrossel salvas.</Alert>}

      <Switch
        label="Exibir o carrossel na home"
        description="Quando desativado, a home usa o hero de texto padrão."
        checked={Boolean(enabled)}
        onChange={(e) => setValue("enabled", e.target.checked)}
      />

      <div className="max-w-xs">
        <Label htmlFor="autoplay_seconds">Troca automática (segundos)</Label>
        <Input
          id="autoplay_seconds"
          type="number"
          min={0}
          max={30}
          {...register("autoplay_seconds")}
        />
        <p className="mt-1 text-xs text-muted">Use 0 para desativar a troca automática.</p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
