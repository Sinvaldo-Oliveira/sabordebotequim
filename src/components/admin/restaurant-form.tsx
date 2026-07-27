"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRestaurant, updateRestaurant } from "@/actions/restaurants";
import { restaurantSchema, type RestaurantInput } from "@/lib/validators/restaurant";
import { slugify } from "@/lib/utils/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/painel/image-upload-field";

type CategoryOption = { id: string; name: string };

export function RestaurantForm({
  restaurantId,
  categories,
  defaultValues,
}: {
  restaurantId?: string;
  categories: CategoryOption[];
  defaultValues?: Partial<RestaurantInput>;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(restaurantId));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RestaurantInput>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      city: "Ribeirão das Neves",
      state: "MG",
      status: "pending",
      is_featured: false,
      ...defaultValues,
    },
  });

  const isFeatured = watch("is_featured");
  const logoUrl = watch("logo_url");
  const cardImageUrl = watch("card_image_url");
  const bannerUrl = watch("banner_url");

  const onSubmit = (values: RestaurantInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = restaurantId
        ? await updateRestaurant(restaurantId, values)
        : await createRestaurant(values);
      if (result?.error) setServerError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Imagens</h2>

        {!restaurantId && (
          <Alert variant="info">
            Salve o restaurante primeiro para liberar o envio de imagens.
          </Alert>
        )}

        {restaurantId && (
          <div className="grid gap-4 sm:grid-cols-3">
            <ImageUploadField
              label="Logo"
              restaurantId={restaurantId}
              purpose="logo"
              aspect="aspect-square"
              value={logoUrl}
              onChange={(url) => setValue("logo_url", url)}
            />
            <ImageUploadField
              label="Banner do card"
              restaurantId={restaurantId}
              purpose="card"
              aspect="aspect-video"
              value={cardImageUrl}
              onChange={(url) => setValue("card_image_url", url)}
            />
            <ImageUploadField
              label="Banner da página pública"
              restaurantId={restaurantId}
              purpose="banner"
              aspect="aspect-video"
              value={bannerUrl}
              onChange={(url) => setValue("banner_url", url)}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Identificação
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome do restaurante</Label>
            <Input
              id="name"
              aria-invalid={Boolean(errors.name)}
              {...register("name", {
                onChange: (e) => {
                  if (!slugTouched) {
                    setValue("slug", slugify(e.target.value));
                  }
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
          <Label htmlFor="category_id">Categoria de votação</Label>
          <Select id="category_id" {...register("category_id")}>
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FieldError message={errors.category_id?.message} />
        </div>

        <div>
          <Label htmlFor="short_description">Descrição curta</Label>
          <Input
            id="short_description"
            placeholder="Frase de efeito exibida nos cards (até 160 caracteres)"
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
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" {...register("city")} />
            <FieldError message={errors.city?.message} />
          </div>
          <div>
            <Label htmlFor="state">Estado (UF)</Label>
            <Input id="state" maxLength={2} {...register("state")} />
            <FieldError message={errors.state?.message} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Publicação</h2>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="pending">Pendente</option>
            <option value="active">Ativo (visível ao público)</option>
            <option value="inactive">Inativo</option>
            <option value="suspended">Suspenso</option>
          </Select>
        </div>
        <Switch
          label="Destacar na landing page"
          description="Exibe este restaurante em posição de destaque na página inicial."
          checked={isFeatured}
          onChange={(e) => setValue("is_featured", e.target.checked)}
        />
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          {isPending ? "Salvando…" : "Salvar restaurante"}
        </Button>
      </div>
    </form>
  );
}
