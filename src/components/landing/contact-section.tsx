import Image from "next/image";
import { UserRound } from "lucide-react";

const DEFAULT_EYEBROW = "Fale com a organização";
const DEFAULT_TITLE = "Conheça o Idealizador";
const DEFAULT_BODY =
  "O Festival Sabor de Botequim nasceu para valorizar a gastronomia e fortalecer os empreendedores de Ribeirão das Neves. Ao lado da equipe da GolMinas e de seus apoiadores, o idealizador do festival tem o orgulho de apresentar o melhor da culinária da cidade, promovendo sabor, cultura e desenvolvimento local. Seja bem-vindo!";

export function ContactSection({
  founderPhotoUrl,
  eyebrow,
  title,
  body,
}: {
  founderPhotoUrl?: string | null;
  eyebrow?: string | null;
  title?: string | null;
  body?: string | null;
}) {
  return (
    <section id="contato" className="scroll-mt-20 bg-surface py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16">
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-cream/70 md:max-w-none">
          {founderPhotoUrl ? (
            <Image
              src={founderPhotoUrl}
              alt="Idealizador do Festival Sabor de Botequim"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <UserRound aria-hidden="true" className="size-16 text-muted" />
            </div>
          )}
        </div>

        <div className="text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
            {eyebrow || DEFAULT_EYEBROW}
          </p>
          <h2 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">
            {title || DEFAULT_TITLE}
          </h2>
          <p className="mt-4 whitespace-pre-line text-muted">{body || DEFAULT_BODY}</p>
        </div>
      </div>
    </section>
  );
}
