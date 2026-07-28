"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type HeroSlide = {
  id: number;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  overlayOpacity: number;
};

export function HeroCarousel({
  slides,
  autoplaySeconds,
}: {
  slides: HeroSlide[];
  autoplaySeconds: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay (respeitando redução de movimento e pausa no hover/foco).
  useEffect(() => {
    if (count <= 1 || paused || autoplaySeconds <= 0) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const timer = setInterval(() => setIndex((i) => (i + 1) % count), autoplaySeconds * 1000);
    return () => clearInterval(timer);
  }, [count, paused, autoplaySeconds]);

  return (
    <section
      id="inicio"
      aria-roledescription="carrossel"
      aria-label="Destaques do festival"
      className="relative w-full overflow-hidden bg-secondary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Dimensões alvo do slider: 1200×600 (proporção 2:1). A proporção
          garante que o object-cover não corte nada de uma imagem enviada
          nesse formato, e os tetos evitam ampliar além do tamanho original
          em telas maiores. Abaixo de 1200px a área reduz proporcionalmente. */}
      <div className="relative mx-auto aspect-[2/1] max-h-[600px] w-full max-w-[1200px]">
        {slides.map((slide, i) => {
          const hasOverlayText = Boolean(slide.title || slide.subtitle || slide.ctaLabel);
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${count}`}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                i === index ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title ?? ""}
                fill
                priority={i === 0}
                sizes="(min-width: 1200px) 1200px, 100vw"
                className="object-cover"
              />

              {/* Faixa curta no topo: só o suficiente para o menu
                  transparente ter contraste, sem escurecer a imagem toda. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
              />

              {/* Escurece a base apenas quando há texto/CTA nosso para
                  proteger — uma imagem-cartaz sem overlay fica intacta. */}
              {hasOverlayText && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, transparent 40%, rgba(51,35,27,${slide.overlayOpacity / 100}) 100%)`,
                  }}
                />
              )}

              {hasOverlayText && (
                <div className="absolute inset-x-0 bottom-0 px-4 pb-8 sm:px-6 sm:pb-10">
                  <div className="mx-auto max-w-6xl text-white">
                    {slide.title && (
                      <h2 className="max-w-2xl font-display text-2xl leading-tight drop-shadow-md sm:text-4xl md:text-5xl">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="mt-2 max-w-xl text-sm text-white/90 drop-shadow sm:text-base">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.ctaLabel && slide.ctaHref && (
                      <Link
                        href={slide.ctaHref}
                        className="mt-4 inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary-strong sm:h-12 sm:text-base"
                      >
                        {slide.ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Slide anterior"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-white backdrop-blur transition-colors hover:bg-ink/60 sm:left-5 sm:size-11"
            >
              <ChevronLeft aria-hidden="true" className="size-5 sm:size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo slide"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-white backdrop-blur transition-colors hover:bg-ink/60 sm:right-5 sm:size-11"
            >
              <ChevronRight aria-hidden="true" className="size-5 sm:size-6" />
            </button>

            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 sm:bottom-4">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir para o slide ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
