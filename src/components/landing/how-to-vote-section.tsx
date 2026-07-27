import { UtensilsCrossed, MousePointerClick, Smartphone, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: UtensilsCrossed,
    title: "Escolha um restaurante",
    description: "Navegue pelos botequins participantes e encontre o seu favorito.",
  },
  {
    icon: MousePointerClick,
    title: "Clique em votar",
    description: "Abra o formulário de votação a partir do card ou da página do restaurante.",
  },
  {
    icon: Smartphone,
    title: "Informe seus dados",
    description:
      "Nome completo e número de WhatsApp — usados só para validar seu voto, nunca exibidos.",
  },
  {
    icon: CheckCircle2,
    title: "Confirme o voto",
    description: "Digite o código que enviamos pelo WhatsApp para concluir a votação.",
  },
];

export function HowToVoteSection() {
  return (
    <section id="como-votar" className="scroll-mt-20 bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
            Passo a passo
          </p>
          <h2 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">Como votar</h2>
        </div>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-xl border border-line bg-surface p-6"
              >
                <span className="font-display text-3xl text-primary/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-3 flex size-11 items-center justify-center rounded-lg bg-primary/12 text-primary-strong">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <p className="mt-4 font-bold text-ink">{step.title}</p>
                <p className="mt-1.5 text-sm text-muted">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
