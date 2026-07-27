import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  AtSign,
  Globe,
  Clock,
  MessageCircle,
  UtensilsCrossed,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { getVotingButtonState } from "@/lib/voting/availability";
import { normalizeOpeningHours, WEEKDAYS } from "@/lib/opening-hours";
import { VoteButton } from "@/components/landing/vote-button";
import { ShareButton } from "@/components/landing/share-button";
import { TrackRestaurantView } from "@/components/landing/track-restaurant-view";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, short_description")
    .eq("slug", slug)
    .maybeSingle();

  return {
    title: restaurant ? restaurant.name : "Restaurante",
    description: restaurant?.short_description ?? undefined,
  };
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const festival = await getCurrentFestival();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (!restaurant) {
    notFound();
  }

  const [{ data: category }, { data: dishes }, { data: gallery }] = await Promise.all([
    restaurant.category_id
      ? supabase
          .from("voting_categories")
          .select("name, status")
          .eq("id", restaurant.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("dishes")
      .select("id, name, description, ingredients, dietary_information, price, main_image_url")
      .eq("restaurant_id", restaurant.id)
      .eq("status", "active"),
    supabase
      .from("restaurant_gallery")
      .select("id, image_url, alt_text")
      .eq("restaurant_id", restaurant.id)
      .order("display_order"),
  ]);

  const dish = dishes?.[0] ?? null;
  const hours = normalizeOpeningHours(restaurant.opening_hours);

  const addressParts = [
    restaurant.address && restaurant.number
      ? `${restaurant.address}, ${restaurant.number}`
      : restaurant.address,
    restaurant.complement,
    restaurant.neighborhood,
  ].filter(Boolean);
  const fullAddress = [...addressParts, restaurant.city, restaurant.state]
    .filter(Boolean)
    .join(", ");
  const hasAddress = addressParts.length > 0;

  const whatsappDigits = restaurant.whatsapp?.replace(/\D/g, "");
  const instagramHandle = restaurant.instagram?.replace(/^@/, "");

  const votingState = getVotingButtonState({
    festivalStatus: festival?.status ?? null,
    votingStartAt: festival?.voting_start_at ?? null,
    votingEndAt: festival?.voting_end_at ?? null,
    restaurantStatus: restaurant.status,
    restaurantDeleted: Boolean(restaurant.deleted_at),
    categoryActive: category?.status === "active",
  });

  return (
    <div>
      <TrackRestaurantView restaurantId={restaurant.id} />

      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-secondary to-primary sm:h-80">
        {restaurant.banner_url && (
          <Image
            src={restaurant.banner_url}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/0 to-black/45"
        />
        <Link
          href="/#restaurantes"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/50 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-ink/70 sm:left-6 sm:top-6"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Restaurantes
        </Link>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="-mt-20 mb-3 sm:-mt-24">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-surface bg-secondary shadow-lg sm:size-28">
            {restaurant.logo_url ? (
              <Image
                src={restaurant.logo_url}
                alt={`Logo de ${restaurant.name}`}
                width={112}
                height={112}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-display text-2xl text-white sm:text-3xl">
                {restaurant.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-secondary sm:text-4xl">
                {restaurant.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {category && <Badge variant="primary">{category.name}</Badge>}
                {restaurant.neighborhood && (
                  <span className="inline-flex items-center gap-1 text-sm text-muted">
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {restaurant.neighborhood}, {restaurant.city}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShareButton
                restaurantId={restaurant.id}
                title={restaurant.name}
                text={`Vote no ${restaurant.name} no Festival Sabor de Botequim!`}
              />
              <VoteButton
                state={votingState}
                restaurant={{
                  id: restaurant.id,
                  name: restaurant.name,
                  slug: restaurant.slug,
                  dishName: dish?.name ?? null,
                  categoryName: category?.name ?? null,
                }}
                className="px-5"
              />
            </div>
          </div>

          {restaurant.short_description && (
            <p className="mt-4 text-lg text-ink">{restaurant.short_description}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-secondary hover:text-secondary"
              >
                <Phone aria-hidden="true" className="size-3.5" />
                {restaurant.phone}
              </a>
            )}
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-leaf hover:text-leaf"
              >
                <MessageCircle aria-hidden="true" className="size-3.5" />
                WhatsApp
              </a>
            )}
            {instagramHandle && (
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-primary hover:text-primary-strong"
              >
                <AtSign aria-hidden="true" className="size-3.5" />
                {restaurant.instagram}
              </a>
            )}
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-secondary hover:text-secondary"
              >
                <Globe aria-hidden="true" className="size-3.5" />
                Site
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 pb-16 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {restaurant.description && (
              <section>
                <h2 className="text-xl font-bold text-ink">Quem é {restaurant.name}</h2>
                <p className="mt-3 whitespace-pre-line text-muted">{restaurant.description}</p>
              </section>
            )}

            {restaurant.story && (
              <section>
                <h2 className="text-xl font-bold text-ink">História</h2>
                <p className="mt-3 whitespace-pre-line text-muted">{restaurant.story}</p>
              </section>
            )}

            {dish && (
              <section>
                <h2 className="text-xl font-bold text-ink">Prato do festival</h2>
                <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
                  {dish.main_image_url && (
                    <div className="relative aspect-[1350/1080] w-full bg-ink/5">
                      <Image
                        src={dish.main_image_url}
                        alt={dish.name}
                        fill
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="font-bold text-ink">{dish.name}</p>
                    {dish.description && (
                      <p className="mt-1.5 text-sm text-muted">{dish.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      {formatCurrency(dish.price) && (
                        <span className="font-semibold text-primary-strong">
                          {formatCurrency(dish.price)}
                        </span>
                      )}
                      {dish.ingredients && (
                        <span className="text-muted">
                          <strong className="text-ink">Ingredientes:</strong> {dish.ingredients}
                        </span>
                      )}
                    </div>
                    {dish.dietary_information && (
                      <p className="mt-2 text-sm text-muted">
                        <strong className="text-ink">Restrições:</strong>{" "}
                        {dish.dietary_information}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {gallery && gallery.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-ink">Galeria</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-ink/5"
                    >
                      <Image
                        src={photo.image_url}
                        alt={photo.alt_text ?? ""}
                        fill
                        sizes="(min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!restaurant.description && !restaurant.story && !dish && (!gallery || gallery.length === 0) && (
              <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
                Este restaurante ainda não completou o perfil. Volte em breve para conhecer mais.
              </p>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h3 className="flex items-center gap-2 font-bold text-ink">
                <Clock aria-hidden="true" className="size-4 text-primary-strong" />
                Horário de funcionamento
              </h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                {WEEKDAYS.map((day) => {
                  const dayHours = hours[day.key];
                  return (
                    <div key={day.key} className="flex justify-between gap-3">
                      <dt className="text-muted">{day.label}</dt>
                      <dd className="font-medium text-ink">
                        {dayHours.closed ? (
                          <span className="text-muted">Fechado</span>
                        ) : (
                          `${dayHours.open} – ${dayHours.close}`
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            {hasAddress && (
              <div className="rounded-xl border border-line bg-surface p-5">
                <h3 className="flex items-center gap-2 font-bold text-ink">
                  <MapPin aria-hidden="true" className="size-4 text-primary-strong" />
                  Endereço
                </h3>
                <p className="mt-2 text-sm text-muted">{fullAddress}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                >
                  Ver no mapa
                </a>
              </div>
            )}

            {!dish && (
              <div className="rounded-xl border border-dashed border-line bg-surface p-5 text-center">
                <UtensilsCrossed aria-hidden="true" className="mx-auto size-6 text-muted" />
                <p className="mt-2 text-sm text-muted">
                  O prato do festival ainda não foi cadastrado.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
