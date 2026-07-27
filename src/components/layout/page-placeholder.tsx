/** Marcador temporário para páginas que serão construídas nas próximas etapas. */
export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl text-secondary">{title}</h1>
      <p className="mt-4 text-muted">
        {description ??
          "Esta página está em construção e estará disponível em breve."}
      </p>
    </section>
  );
}
