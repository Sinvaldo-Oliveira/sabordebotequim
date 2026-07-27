"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UtensilsCrossed } from "lucide-react";
import { submitRestaurantProfile } from "@/actions/restaurant-profile";
import {
  restaurantProfileSchema,
  type RestaurantProfileInput,
} from "@/lib/validators/restaurant-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ImageUploadField } from "@/components/painel/image-upload-field";
import { OpeningHoursEditor } from "@/components/painel/opening-hours-editor";
import { GalleryManager, type GalleryPhoto } from "@/components/painel/gallery-manager";

export function RestaurantProfileForm({
  restaurantId,
  restaurantName,
  categoryName,
  requiresApproval,
  defaultValues,
  galleryPhotos,
}: {
  restaurantId: string;
  restaurantName: string;
  categoryName: string | null;
  requiresApproval: boolean;
  defaultValues: RestaurantProfileInput;
  galleryPhotos: GalleryPhoto[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<"published" | "pending" | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RestaurantProfileInput>({
    resolver: zodResolver(restaurantProfileSchema),
    defaultValues,
  });

  const values = watch();

  const onSubmit = (data: RestaurantProfileInput) => {
    setServerError(null);
    setSuccessStatus(null);
    startTransition(async () => {
      const result = await submitRestaurantProfile(data);
      if ("error" in result) {
        setServerError(result.error);
        return;
      }
      setSuccessStatus(result.status);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 lg:col-span-2">
        {requiresApproval && (
          <Alert variant="info">
            As alterações enviadas aqui passam por aprovação da organização antes de ficarem
            visíveis ao público.
          </Alert>
        )}
        {serverError && <Alert variant="error">{serverError}</Alert>}
        {successStatus === "published" && (
          <Alert variant="success">Alterações publicadas com sucesso.</Alert>
        )}
        {successStatus === "pending" && (
          <Alert variant="info">
            Alterações enviadas para aprovação da organização do festival.
          </Alert>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Imagens</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Logo"
              restaurantId={restaurantId}
              purpose="logo"
              aspect="aspect-square"
              value={values.logo_url}
              onChange={(url) => setValue("logo_url", url)}
            />
            <ImageUploadField
              label="Banner"
              restaurantId={restaurantId}
              purpose="banner"
              aspect="aspect-video"
              value={values.banner_url}
              onChange={(url) => setValue("banner_url", url)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Sobre</h2>
          <div>
            <Label htmlFor="short_description">Descrição curta</Label>
            <Input
              id="short_description"
              placeholder="Frase de efeito exibida no card (até 160 caracteres)"
              aria-invalid={Boolean(errors.short_description)}
              {...register("short_description")}
            />
            <FieldError message={errors.short_description?.message} />
          </div>
          <div>
            <Label htmlFor="description">Descrição completa</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div>
            <Label htmlFor="story">História do restaurante</Label>
            <Textarea id="story" {...register("story")} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Contato</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" placeholder="55319XXXXXXXX" {...register("whatsapp")} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="website">Site</Label>
              <Input id="website" placeholder="https://" {...register("website")} />
              <FieldError message={errors.website?.message} />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" placeholder="@usuario" {...register("instagram")} />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" {...register("facebook")} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Endereço</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="address">Rua</Label>
              <Input id="address" {...register("address")} />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register("number")} />
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register("complement")} />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" {...register("neighborhood")} />
            </div>
            <div>
              <Label htmlFor="postal_code">CEP</Label>
              <Input id="postal_code" {...register("postal_code")} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Horário de funcionamento
          </h2>
          <OpeningHoursEditor register={register} watch={watch} setValue={setValue} />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Prato do festival
          </h2>
          <div>
            <Label htmlFor="dish_name">Nome do prato</Label>
            <Input id="dish_name" {...register("dish_name")} />
          </div>
          <div>
            <Label htmlFor="dish_description">Descrição do prato</Label>
            <Textarea id="dish_description" {...register("dish_description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dish_ingredients">Ingredientes</Label>
              <Textarea id="dish_ingredients" rows={3} {...register("dish_ingredients")} />
            </div>
            <div>
              <Label htmlFor="dish_dietary_information">Restrições alimentares</Label>
              <Textarea
                id="dish_dietary_information"
                rows={3}
                placeholder="Ex.: contém glúten, opção vegetariana…"
                {...register("dish_dietary_information")}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dish_price">Preço (R$)</Label>
            <Input
              id="dish_price"
              type="number"
              step="0.01"
              min={0}
              className="max-w-40"
              {...register("dish_price")}
            />
          </div>
          <ImageUploadField
            label="Foto do prato"
            restaurantId={restaurantId}
            purpose="dish"
            aspect="aspect-video"
            value={values.dish_main_image_url}
            onChange={(url) => setValue("dish_main_image_url", url)}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Galeria</h2>
          <p className="text-xs text-muted">
            Fotos da galeria são publicadas imediatamente, sem passar pela aprovação.
          </p>
          <GalleryManager restaurantId={restaurantId} photos={galleryPhotos} />
        </section>

        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          {isPending ? "Salvando…" : requiresApproval ? "Enviar para aprovação" : "Publicar alterações"}
        </Button>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Pré-visualização
        </p>
        <article className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="relative h-32 w-full bg-ink/10">
            {values.banner_url ? (
              <Image src={values.banner_url} alt="" fill sizes="400px" className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-secondary to-primary">
                <UtensilsCrossed aria-hidden="true" className="size-7 text-white/70" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-ink">{restaurantName}</h3>
            <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted">
              {categoryName && (
                <span className="font-semibold text-primary-strong">{categoryName}</span>
              )}
              {values.neighborhood && <span>{values.neighborhood}</span>}
            </div>
            {values.short_description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted">{values.short_description}</p>
            )}
            {values.dish_name && (
              <p className="mt-3 text-sm text-ink">
                Prato: <span className="font-semibold">{values.dish_name}</span>
              </p>
            )}
          </div>
        </article>
        <p className="mt-2 text-xs text-muted">
          Pré-visualização com os valores digitados — reflete como o card ficará após a
          publicação.
        </p>
      </div>
    </div>
  );
}
