import { RestaurantCard, type RestaurantCardData } from "@/components/landing/restaurant-card";
import { RevealOnScroll } from "@/components/landing/reveal-on-scroll";

export function RestaurantsSection({ restaurants }: { restaurants: RestaurantCardData[] }) {
  return (
    <section id="restaurantes" className="scroll-mt-20 bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
            Participantes
          </p>
          <h2 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">
            Restaurantes do festival
          </h2>
          <p className="mt-3 text-muted">
            Conheça os botequins participantes desta edição e descubra o prato que cada um
            preparou para o festival.
          </p>
        </div>

        {restaurants.length === 0 ? (
          <p className="mx-auto mt-12 max-w-md rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
            Os restaurantes participantes serão anunciados em breve. Volte logo para conhecer os
            botequins do festival.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <RevealOnScroll key={restaurant.slug} delayMs={Math.min(index * 90, 450)}>
                <RestaurantCard restaurant={restaurant} />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
