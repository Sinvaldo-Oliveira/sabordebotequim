import { createClient } from "@/lib/supabase/server";
import { getCurrentFestival } from "@/lib/festival";
import { getVotingButtonState } from "@/lib/voting/availability";
import { HeroSection } from "@/components/landing/hero-section";
import { HeroCarousel, type HeroSlide } from "@/components/landing/hero-carousel";
import { TransparentHeaderTrigger } from "@/components/layout/header-mode";
import { PresentationSection } from "@/components/landing/presentation-section";
import { RestaurantsSection } from "@/components/landing/restaurants-section";
import type { RestaurantCardData } from "@/components/landing/restaurant-card";
import { HowToVoteSection } from "@/components/landing/how-to-vote-section";
import type { SponsorLogo } from "@/components/landing/sponsors-carousel";
import { RegulationSection } from "@/components/landing/regulation-section";
import { ContactSection } from "@/components/landing/contact-section";

type LandingContent = {
  body?: string;
  primary_cta?: string;
  secondary_cta?: string;
};

const DEFAULT_HERO = {
  eyebrow: "Festival Gastronômico e Cultural de Ribeirão das Neves",
  subtitle: "Conheça os botequins participantes, descubra os pratos do festival e vote no seu favorito.",
  primaryCta: "Conheça os participantes",
  secondaryCta: "Vote agora",
};

const DEFAULT_PRESENTATION = {
  title: "Sobre o festival",
  subtitle: "Gastronomia e cultura popular no coração de Ribeirão das Neves",
  body: "O Sabor de Botequim celebra os bares e botequins que fazem parte da história da cidade, valorizando gastronomia, música e tradição local.",
};

/** Landing page — página única com todas as seções públicas do festival. */
export default async function HomePage() {
  const festival = await getCurrentFestival();
  const supabase = await createClient();

  let restaurants: RestaurantCardData[] = [];
  let sponsors: SponsorLogo[] = [];
  let hero = DEFAULT_HERO;
  let presentation = DEFAULT_PRESENTATION;
  let heroSlides: HeroSlide[] = [];
  let carouselAutoplay = 6;
  let carouselEnabled = true;
  let sponsorsCarouselAutoplay = 30;
  let sponsorsCarouselEnabled = true;
  let sponsorsCarouselZoomScale = 1.25;
  let sponsorsCarouselBackgroundUrl: string | null = null;
  let founderPhotoUrl: string | null = null;
  let founderEyebrow: string | null = null;
  let founderTitle: string | null = null;
  let founderBody: string | null = null;

  if (festival) {
    const [
      restaurantsResult,
      categoriesResult,
      sponsorsResult,
      sectionsResult,
      dishesResult,
      slidesResult,
    ] = await Promise.all([
        supabase
          .from("restaurants")
          .select(
            "id, slug, name, short_description, logo_url, card_image_url, neighborhood, category_id, is_featured, status, deleted_at",
          )
          .eq("festival_id", festival.id)
          .eq("status", "active")
          .is("deleted_at", null)
          .order("display_order"),
        supabase
          .from("voting_categories")
          .select("id, name, status")
          .eq("festival_id", festival.id),
        supabase
          .from("sponsors")
          .select("id, name, logo_url, website_url")
          .eq("festival_id", festival.id)
          .eq("status", "active")
          .order("display_order"),
        supabase
          .from("landing_sections")
          .select("section_key, title, subtitle, content")
          .eq("festival_id", festival.id)
          .eq("is_active", true),
        supabase
          .from("dishes")
          .select("restaurant_id, name")
          .eq("status", "active"),
        supabase
          .from("hero_slides")
          .select("id, image_url, title, subtitle, cta_label, cta_href, overlay_opacity")
          .eq("festival_id", festival.id)
          .eq("is_active", true)
          .order("display_order"),
      ]);

    heroSlides = (slidesResult.data ?? []).map((s) => ({
      id: s.id,
      imageUrl: s.image_url,
      title: s.title,
      subtitle: s.subtitle,
      ctaLabel: s.cta_label,
      ctaHref: s.cta_href,
      overlayOpacity: s.overlay_opacity,
    }));

    const categoryById = new Map((categoriesResult.data ?? []).map((c) => [c.id, c]));
    const dishByRestaurant = new Map<string, string>();
    for (const dish of dishesResult.data ?? []) {
      if (!dishByRestaurant.has(dish.restaurant_id)) {
        dishByRestaurant.set(dish.restaurant_id, dish.name);
      }
    }

    restaurants = (restaurantsResult.data ?? []).map((r) => {
      const category = r.category_id ? categoryById.get(r.category_id) : undefined;
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        shortDescription: r.short_description,
        logoUrl: r.logo_url,
        cardImageUrl: r.card_image_url,
        neighborhood: r.neighborhood,
        categoryName: category?.name ?? null,
        dishName: dishByRestaurant.get(r.id) ?? null,
        isFeatured: r.is_featured,
        votesCount: null as number | null,
        votingState: getVotingButtonState({
          festivalStatus: festival.status,
          votingStartAt: festival.voting_start_at,
          votingEndAt: festival.voting_end_at,
          restaurantStatus: r.status,
          restaurantDeleted: Boolean(r.deleted_at),
          categoryActive: category?.status === "active",
        }),
      };
    });

    sponsors = (sponsorsResult.data ?? [])
      .filter((s): s is typeof s & { logo_url: string } => Boolean(s.logo_url))
      .map((s) => ({
        id: s.id,
        name: s.name,
        logoUrl: s.logo_url,
        websiteUrl: s.website_url,
      }));

    const sectionByKey = new Map((sectionsResult.data ?? []).map((s) => [s.section_key, s]));

    const heroSection = sectionByKey.get("hero");
    if (heroSection) {
      const content = (heroSection.content ?? {}) as LandingContent;
      hero = {
        eyebrow: heroSection.subtitle ?? DEFAULT_HERO.eyebrow,
        subtitle: content.body ?? DEFAULT_HERO.subtitle,
        primaryCta: content.primary_cta ?? DEFAULT_HERO.primaryCta,
        secondaryCta: content.secondary_cta ?? DEFAULT_HERO.secondaryCta,
      };
    }

    const presentationSection = sectionByKey.get("presentation");
    if (presentationSection) {
      const content = (presentationSection.content ?? {}) as LandingContent;
      presentation = {
        title: presentationSection.title ?? DEFAULT_PRESENTATION.title,
        subtitle: presentationSection.subtitle ?? DEFAULT_PRESENTATION.subtitle,
        body: content.body ?? DEFAULT_PRESENTATION.body,
      };
    }

    // Config do carrossel (chave public_ exposta pela RPC get_public_settings).
    const { data: publicSettings } = await supabase.rpc("get_public_settings", {
      p_festival_id: festival.id,
    });
    const settings = publicSettings as Record<
      string,
      {
        enabled?: boolean;
        autoplay_seconds?: number;
        speed_seconds?: number;
        zoom_scale?: number;
        background_url?: string;
        url?: string;
        eyebrow?: string;
        title?: string;
        body?: string;
      }
    > | null;

    const carousel = settings?.public_hero_carousel;
    if (carousel) {
      carouselEnabled = carousel.enabled !== false;
      carouselAutoplay = carousel.autoplay_seconds ?? 6;
    }

    const sponsorsCarousel = settings?.public_sponsors_carousel;
    if (sponsorsCarousel) {
      sponsorsCarouselEnabled = sponsorsCarousel.enabled !== false;
      sponsorsCarouselAutoplay = sponsorsCarousel.speed_seconds ?? 30;
      sponsorsCarouselZoomScale = sponsorsCarousel.zoom_scale ?? 1.25;
      sponsorsCarouselBackgroundUrl = sponsorsCarousel.background_url || null;
    }

    const founder = settings?.public_founder_photo;
    founderPhotoUrl = founder?.url || null;
    founderEyebrow = founder?.eyebrow || null;
    founderTitle = founder?.title || null;
    founderBody = founder?.body || null;

    // Placar público: quando ativado, cada card mostra o total de votos e
    // os restaurantes ficam ordenados do mais votado para o menos votado.
    // A visibilidade real é decidida dentro da própria RPC (não só aqui),
    // então mesmo essa checagem servindo de "settings?.public_show_vote_counts"
    // é só para decidir se ordenamos — o valor retornado já vem zerado
    // quando oculto.
    const showVoteCounts = settings?.public_show_vote_counts?.enabled !== false;

    const { data: voteCounts } = await supabase.rpc("get_public_vote_counts", {
      p_festival_id: festival.id,
    });

    if (showVoteCounts && voteCounts) {
      const votesByRestaurant = new Map(voteCounts.map((v) => [v.restaurant_id, v.votes_count]));
      restaurants = restaurants
        .map((r) => ({ ...r, votesCount: votesByRestaurant.get(r.id) ?? 0 }))
        .sort((a, b) => (b.votesCount ?? 0) - (a.votesCount ?? 0));
    }
  }

  const showCarousel = carouselEnabled && heroSlides.length > 0;

  return (
    <>
      {showCarousel ? (
        <>
          <TransparentHeaderTrigger />
          <HeroCarousel slides={heroSlides} autoplaySeconds={carouselAutoplay} />
        </>
      ) : (
        <HeroSection {...hero} />
      )}
      <HowToVoteSection />
      <RestaurantsSection restaurants={restaurants} />
      <PresentationSection
        {...presentation}
        sponsors={sponsorsCarouselEnabled ? sponsors : []}
        sponsorsSpeedSeconds={sponsorsCarouselAutoplay}
        sponsorsZoomScale={sponsorsCarouselZoomScale}
        sponsorsBackgroundUrl={sponsorsCarouselBackgroundUrl}
      />
      <RegulationSection
        votingStartAt={festival?.voting_start_at ?? null}
        votingEndAt={festival?.voting_end_at ?? null}
      />
      <ContactSection
        founderPhotoUrl={founderPhotoUrl}
        eyebrow={founderEyebrow}
        title={founderTitle}
        body={founderBody}
      />
    </>
  );
}
