"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import {
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlide,
  moveHeroSlide,
} from "@/actions/hero-slides";
import { heroSlideSchema, type HeroSlideInput } from "@/lib/validators/hero-slide";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { FestivalImageUpload } from "@/components/admin/festival-image-upload";
import { cn } from "@/lib/utils/cn";

export type SlideRow = {
  id: number;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  overlay_opacity: number;
  is_active: boolean;
};

export function HeroSlideManager({ slides }: { slides: SlideRow[] }) {
  const [editing, setEditing] = useState<SlideRow | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">
          {slides.length} slide(s). Arraste a ordem com as setas; a proporção recomendada é
          1920×1080.
        </p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className={buttonVariants({ size: "sm", className: "gap-1.5" })}
        >
          <Plus className="size-4" />
          Novo slide
        </button>
      </div>

      {slides.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Nenhum slide ainda. Clique em &quot;Novo slide&quot; para começar o carrossel.
        </p>
      ) : (
        <ul className="space-y-3">
          {slides.map((slide, i) => (
            <li
              key={slide.id}
              className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-ink/5">
                <Image src={slide.image_url} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {slide.title || <span className="text-muted">(sem título)</span>}
                </p>
                {slide.subtitle && (
                  <p className="truncate text-xs text-muted">{slide.subtitle}</p>
                )}
                {!slide.is_active && (
                  <span className="mt-1 inline-block rounded bg-ink/8 px-2 py-0.5 text-xs font-semibold text-muted">
                    Oculto
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0 || isPending}
                  onClick={() => startTransition(() => moveHeroSlide(slide.id, "up"))}
                  aria-label="Mover para cima"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={i === slides.length - 1 || isPending}
                  onClick={() => startTransition(() => moveHeroSlide(slide.id, "down"))}
                  aria-label="Mover para baixo"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => toggleHeroSlide(slide.id, !slide.is_active))
                  }
                  aria-label={slide.is_active ? "Ocultar slide" : "Exibir slide"}
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink"
                >
                  {slide.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(slide)}
                  aria-label="Editar slide"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("Remover este slide do carrossel?")) {
                      startTransition(() => deleteHeroSlide(slide.id));
                    }
                  }}
                  aria-label="Remover slide"
                  className="flex size-8 items-center justify-center rounded-md text-error hover:bg-error/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <SlideFormModal slide={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function SlideFormModal({ slide, onClose }: { slide: SlideRow | null; onClose: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HeroSlideInput>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      image_url: slide?.image_url ?? "",
      title: slide?.title ?? "",
      subtitle: slide?.subtitle ?? "",
      cta_label: slide?.cta_label ?? "",
      cta_href: slide?.cta_href ?? "",
      overlay_opacity: slide?.overlay_opacity ?? 35,
      is_active: slide?.is_active ?? true,
    },
  });

  const imageUrl = watch("image_url");
  const isActive = watch("is_active");
  const overlay = watch("overlay_opacity");

  const onSubmit = (values: HeroSlideInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = slide
        ? await updateHeroSlide(slide.id, values)
        : await createHeroSlide(values);
      if ("error" in result) setServerError(result.error);
      else onClose();
    });
  };

  return (
    <Modal open onClose={onClose} title={slide ? "Editar slide" : "Novo slide"} className="sm:max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <FestivalImageUpload
          label="Imagem do slide (1920×1080)"
          purpose="hero"
          hint="JPG, PNG ou WebP, até 5 MB."
          value={imageUrl}
          onChange={(url) => setValue("image_url", url, { shouldValidate: true })}
        />
        {errors.image_url && (
          <p role="alert" className="text-sm font-medium text-error">
            {errors.image_url.message}
          </p>
        )}

        <div>
          <Label htmlFor="title">Título (opcional)</Label>
          <Input id="title" {...register("title")} />
        </div>
        <div>
          <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
          <Textarea id="subtitle" rows={2} {...register("subtitle")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cta_label">Texto do botão (opcional)</Label>
            <Input id="cta_label" placeholder="Ex.: Vote agora" {...register("cta_label")} />
          </div>
          <div>
            <Label htmlFor="cta_href">Link do botão (opcional)</Label>
            <Input id="cta_href" placeholder="/#restaurantes" {...register("cta_href")} />
          </div>
        </div>

        <div>
          <Label htmlFor="overlay_opacity">
            Escurecer imagem para leitura do texto: {Number(overlay)}%
          </Label>
          <input
            id="overlay_opacity"
            type="range"
            min={0}
            max={90}
            step={5}
            className="w-full accent-[var(--brand-primary)]"
            value={Number(overlay)}
            onChange={(e) => setValue("overlay_opacity", Number(e.target.value))}
          />
        </div>

        <Switch
          label="Slide visível no carrossel"
          checked={Boolean(isActive)}
          onChange={(e) => setValue("is_active", e.target.checked)}
        />

        <div className={cn("flex justify-end gap-2 pt-2")}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />}
            {isPending ? "Salvando…" : "Salvar slide"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
