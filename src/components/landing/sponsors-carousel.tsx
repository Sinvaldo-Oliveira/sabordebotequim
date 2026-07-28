import Image from "next/image";
import type { CSSProperties } from "react";

export type SponsorLogo = {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
};

export function SponsorsCarousel({
  sponsors,
  speedSeconds,
  zoomScale = 1.25,
}: {
  sponsors: SponsorLogo[];
  speedSeconds: number;
  /** Quanto a logomarca cresce no hover (1 a 3, ex.: 1.25 = 125%). */
  zoomScale?: number;
}) {
  if (sponsors.length === 0) return null;

  // Duplica a lista para o loop ficar contínuo (na metade da animação volta
  // ao ponto de partida visualmente idêntico).
  const track = [...sponsors, ...sponsors];

  return (
    // Sem overflow-hidden aqui de propósito: um ancestral com overflow
    // cortaria a logomarca ao crescer no hover (zoom-out-of-bounds).
    <div className="border-t border-line/60 pt-10">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
        Apoio e patrocínio
      </p>
      <div
        // Só corta os excedentes na horizontal (efeito de loop infinito).
        // Na vertical fica sem clipe (overflow-x-clip, não overflow-hidden),
        // para a logomarca ampliada nunca ser cortada, e o respiro vertical
        // evita que ela invada o conteúdo vizinho ao crescer.
        className="sponsor-marquee mt-6 overflow-x-clip py-16"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          className="sponsor-marquee-track flex w-max items-center gap-12 sm:gap-16"
          style={{ animationDuration: `${speedSeconds}s` }}
        >
          {track.map((sponsor, i) => {
            const content = (
              <Image
                src={sponsor.logoUrl}
                alt={sponsor.name}
                width={420}
                height={168}
                style={{ "--sponsor-zoom": zoomScale } as CSSProperties}
                // No celular não existe hover (o Tailwind v4 limita `hover:`
                // a dispositivos com mouse), então as logos já aparecem
                // coloridas e o toque dispara o zoom via `active:`.
                className="relative h-30 w-auto scale-100 object-contain transition-all duration-500 ease-out active:scale-[var(--sponsor-zoom)] max-sm:opacity-100 max-sm:grayscale-0 sm:h-36 sm:opacity-70 sm:grayscale sm:hover:z-10 sm:hover:scale-[var(--sponsor-zoom)] sm:hover:opacity-100 sm:hover:grayscale-0"
              />
            );
            return (
              <div key={`${sponsor.id}-${i}`} aria-hidden={i >= sponsors.length} className="shrink-0">
                {sponsor.websiteUrl ? (
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={sponsor.name}
                    tabIndex={i >= sponsors.length ? -1 : 0}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
