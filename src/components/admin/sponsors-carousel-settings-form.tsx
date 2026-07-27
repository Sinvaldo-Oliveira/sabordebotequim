"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveSponsorsCarouselSettings } from "@/actions/sponsors";
import {
  sponsorsCarouselSettingsSchema,
  type SponsorsCarouselSettingsInput,
} from "@/lib/validators/sponsor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { FestivalImageUpload } from "@/components/admin/festival-image-upload";

export function SponsorsCarouselSettingsForm({
  defaultValues,
}: {
  defaultValues: SponsorsCarouselSettingsInput;
}) {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue } = useForm<SponsorsCarouselSettingsInput>({
    resolver: zodResolver(sponsorsCarouselSettingsSchema),
    defaultValues,
  });

  const enabled = watch("enabled");
  const zoomScale = watch("zoom_scale");
  const backgroundUrl = watch("background_url");

  const onSubmit = (values: SponsorsCarouselSettingsInput) => {
    setServerError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveSponsorsCarouselSettings(values);
      if ("error" in result) setServerError(result.error);
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      {saved && <Alert variant="success">Configurações do carrossel salvas.</Alert>}

      <Switch
        label="Exibir o carrossel de patrocinadores"
        description="Quando desativado, a seção 'Sobre o festival' fica só com o texto."
        checked={Boolean(enabled)}
        onChange={(e) => setValue("enabled", e.target.checked)}
      />

      <div className="max-w-xs">
        <Label htmlFor="speed_seconds">Duração de uma volta completa (segundos)</Label>
        <Input id="speed_seconds" type="number" min={10} max={120} {...register("speed_seconds")} />
        <p className="mt-1 text-xs text-muted">
          Quanto menor, mais rápido as logomarcas deslizam.
        </p>
      </div>

      <div className="max-w-xs">
        <Label htmlFor="zoom_scale">Zoom ao passar o mouse</Label>
        <div className="flex items-center gap-3">
          <input
            id="zoom_scale"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={Number(zoomScale ?? 1.25)}
            onChange={(e) => setValue("zoom_scale", Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-primary"
          />
          <span className="w-14 shrink-0 text-right text-sm font-semibold text-ink">
            {Number(zoomScale ?? 1.25).toFixed(2)}x
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Quanto a logomarca aumenta ao passar o mouse (de 1x até 3x o tamanho original). A
          transição continua suave e fluida.
        </p>
      </div>

      <div className="max-w-sm">
        <FestivalImageUpload
          label="Imagem de fundo da seção"
          purpose="sponsors-section-bg"
          value={backgroundUrl}
          onChange={(url) => setValue("background_url", url)}
          aspect="aspect-[1920/280]"
          hint="Aparece atrás do título 'Apoio e patrocínio' e das logomarcas, com uma leve transparência."
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
