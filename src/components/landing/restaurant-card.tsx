import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, UtensilsCrossed, Vote } from "lucide-react";
import { VoteButton } from "@/components/landing/vote-button";
import type { VotingButtonState } from "@/lib/voting/availability";

export type RestaurantCardData = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  logoUrl: string | null;
  cardImageUrl: string | null;
  neighborhood: string | null;
  categoryName: string | null;
  dishName: string | null;
  isFeatured: boolean;
  votingState: VotingButtonState;
  /** null = placar oculto (config do admin); number = total de votos válidos. */
  votesCount: number | null;
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-secondary/40 hover:shadow-xl hover:shadow-ink/10">
      <div className="relative h-36 w-full overflow-hidden bg-ink/10">
        {restaurant.cardImageUrl ? (
          <Image
            src={restaurant.cardImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-secondary to-primary">
            <UtensilsCrossed aria-hidden="true" className="size-8 text-white/70" />
          </div>
        )}
        {restaurant.isFeatured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
            <Star aria-hidden="true" className="size-3 fill-ink" />
            Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-ink">{restaurant.name}</h3>
          {restaurant.votesCount !== null && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-leaf/12 px-2.5 py-1 text-xs font-bold text-leaf"
              title={`${restaurant.votesCount} ${restaurant.votesCount === 1 ? "voto" : "votos"}`}
            >
              <Vote aria-hidden="true" className="size-3.5" />
              {restaurant.votesCount.toLocaleString("pt-BR")}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {restaurant.categoryName && (
            <span className="font-semibold text-primary-strong">{restaurant.categoryName}</span>
          )}
          {restaurant.neighborhood && (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {restaurant.neighborhood}
            </span>
          )}
        </div>

        {restaurant.shortDescription && (
          <p className="mt-3 line-clamp-2 text-sm text-muted">{restaurant.shortDescription}</p>
        )}

        <div className="mt-4 flex flex-1 items-end gap-2">
          <Link
            href={`/restaurantes/${restaurant.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border-2 border-secondary px-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white"
          >
            Conhecer restaurante
          </Link>
          <VoteButton
            state={restaurant.votingState}
            restaurant={{
              id: restaurant.id,
              name: restaurant.name,
              slug: restaurant.slug,
              dishName: restaurant.dishName,
              categoryName: restaurant.categoryName,
            }}
          />
        </div>
      </div>
    </article>
  );
}
