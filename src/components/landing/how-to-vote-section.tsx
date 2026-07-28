import { UtensilsCrossed, MousePointerClick, Smartphone, CheckCircle2 } from "lucide-react";
import { RevealOnScroll } from "@/components/landing/reveal-on-scroll";

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
              <li key={step.title} className="h-full">
                {/* Entrada em cascata ao rolar; o hover fica no card interno
                    para não competir com a transição de revelação. */}
                <RevealOnScroll delayMs={Math.min(index * 110, 440)} className="h-full">
                  <div className="group flex h-full gap-4 rounded-xl border border-line bg-surface p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-ink/10">
                    {/* Coluna fixa: número acima do ícone. */}
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      <span className="font-display text-3xl leading-none text-primary/25 transition-colors duration-300 group-hover:text-primary/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex size-11 items-center justify-center rounded-lg bg-primary/12 text-primary-strong transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                    </div>

                    {/* Texto alinhado ao lado do número e do ícone. */}
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{step.title}</p>
                      <p className="mt-1.5 text-sm text-muted">{step.description}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
