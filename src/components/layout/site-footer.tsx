import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Regulamento", href: "/#regulamento" },
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos de Uso", href: "/termos-de-uso" },
  { label: "Contato", href: "/#contato" },
];

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-primary bg-secondary text-white/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg">Sabor de Botequim</p>
          <p className="mt-2 text-sm text-white/70">
            Festival Gastronômico e Cultural de Ribeirão das Neves.
          </p>
        </div>
        <nav aria-label="Links úteis" className="flex flex-col gap-2">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/80 transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-white/70 md:text-right">
          <p>Ribeirão das Neves — MG</p>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/60">
        @websic | @ConectyIA | Todos os direitos reservados. ©Sabor de Botequim{" "}
        {new Date().getFullYear()} .
      </div>
    </footer>
  );
}
