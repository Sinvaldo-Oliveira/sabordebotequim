import Link from "next/link";

export function HeroSection({
  eyebrow,
  subtitle,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
}) {
  return (
    <section id="inicio" className="scroll-mt-20 bg-cream">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="mb-4 rounded-full bg-accent/20 px-4 py-1 text-sm font-semibold text-secondary">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl leading-tight text-secondary sm:text-6xl">
          Sabor <span className="text-primary">de</span> Botequim
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">{subtitle}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#restaurantes"
            className="rounded-lg bg-primary px-7 py-3.5 font-semibold text-white transition-colors hover:bg-primary-strong"
          >
            {primaryCta}
          </Link>
          <Link
            href="/#restaurantes"
            className="rounded-lg border-2 border-secondary px-7 py-3.5 font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white"
          >
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
