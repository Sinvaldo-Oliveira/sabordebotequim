import Image from "next/image";
import { SponsorsCarousel, type SponsorLogo } from "@/components/landing/sponsors-carousel";

export function PresentationSection({
  title,
  subtitle,
  body,
  sponsors,
  sponsorsSpeedSeconds,
  sponsorsZoomScale,
  sponsorsBackgroundUrl,
}: {
  title: string;
  subtitle: string;
  body: string;
  sponsors?: SponsorLogo[];
  sponsorsSpeedSeconds?: number;
  sponsorsZoomScale?: number;
  sponsorsBackgroundUrl?: string | null;
}) {
  return (
    // Sem overflow-hidden aqui de propósito: cortaria a logomarca ao crescer
    // no hover do carrossel de patrocinadores (zoom-out-of-bounds).
    <section id="sobre" className="relative scroll-mt-20 bg-surface py-20">
      {sponsorsBackgroundUrl && (
        <>
          <Image
            src={sponsorsBackgroundUrl}
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none absolute inset-0 object-cover"
          />
          {/* Escurece um pouco a foto para o texto branco continuar legível. */}
          <div className="pointer-events-none absolute inset-0 bg-ink/45" />
        </>
      )}
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2
          className={`font-display text-3xl sm:text-4xl ${sponsorsBackgroundUrl ? "text-white" : "text-secondary"}`}
        >
          {title}
        </h2>
        <p
          className={`mt-2 text-lg font-semibold ${sponsorsBackgroundUrl ? "text-white" : "text-primary-strong"}`}
        >
          {subtitle}
        </p>
        <p className={`mt-5 ${sponsorsBackgroundUrl ? "text-white/90" : "text-muted"}`}>{body}</p>
      </div>

      {sponsors && sponsors.length > 0 && (
        <div className="relative z-10 mx-auto mt-14 max-w-5xl px-4 sm:px-6">
          <SponsorsCarousel
            sponsors={sponsors}
            speedSeconds={sponsorsSpeedSeconds ?? 30}
            zoomScale={sponsorsZoomScale ?? 1.25}
          />
        </div>
      )}
    </section>
  );
}
