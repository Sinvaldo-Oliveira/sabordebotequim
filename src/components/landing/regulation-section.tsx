const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function RegulationSection({
  votingStartAt,
  votingEndAt,
}: {
  votingStartAt: string | null;
  votingEndAt: string | null;
}) {
  const period =
    votingStartAt && votingEndAt
      ? `de ${DATE_FORMATTER.format(new Date(votingStartAt))} até ${DATE_FORMATTER.format(new Date(votingEndAt))}`
      : "conforme divulgado pela organização";

  return (
    <section id="regulamento" className="scroll-mt-20 bg-cream py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
            Regras do festival
          </p>
          <h2 className="mt-2 font-display text-3xl text-secondary sm:text-4xl">Regulamento</h2>
        </div>

        <div className="mt-10 space-y-6 rounded-xl border border-line bg-surface p-6 sm:p-8">
          <div>
            <h3 className="font-bold text-ink">Período de votação</h3>
            <p className="mt-1 text-sm text-muted">A votação acontece {period}.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink">Elegibilidade do voto</h3>
            <p className="mt-1 text-sm text-muted">
              A votação é identificada pelo número de telefone (WhatsApp): cada número pode
              registrar um voto por edição do festival. O voto só é confirmado após a
              validação do código enviado por WhatsApp, e o sistema impede automaticamente
              votos duplicados.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-ink">Privacidade dos dados</h3>
            <p className="mt-1 text-sm text-muted">
              Nome e número de telefone são usados apenas para validar o voto e nunca são
              exibidos publicamente. Consulte a{" "}
              <a href="/politica-de-privacidade" className="underline hover:text-ink">
                Política de Privacidade
              </a>
              .
            </p>
          </div>
          <div>
            <h3 className="font-bold text-ink">Apuração e integridade</h3>
            <p className="mt-1 text-sm text-muted">
              A organização pode invalidar votos com indícios de fraude ou automação.
              Somente votos válidos entram na apuração final.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Este é o regulamento vigente desta edição. Em caso de dúvida, fale com a organização
          pelo canal de contato abaixo.
        </p>
      </div>
    </section>
  );
}
