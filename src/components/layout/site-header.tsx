"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useHeaderMode } from "@/components/layout/header-mode";

const NAV_ITEMS = [
  { label: "Início", href: "/#inicio" },
  { label: "Restaurantes", href: "/#restaurantes" },
  { label: "Como votar", href: "/#como-votar" },
  { label: "Regulamento", href: "/#regulamento" },
  { label: "Contato", href: "/#contato" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { transparent } = useHeaderMode();

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  // Modo claro (texto branco sobre a imagem): só no topo, sem rolagem e
  // com o menu mobile fechado. Vale apenas no desktop — no celular o
  // cabeçalho é sempre sólido.
  const light = transparent && !scrolled && !menuOpen;

  // No desktop o cabeçalho pode sobrepor o hero (fixed + transparente).
  // No celular ele fica sempre sólido e no fluxo da página, para o
  // carrossel começar abaixo dele em vez de ficar encoberto.
  const desktopClasses = transparent
    ? light
      ? "md:fixed md:border-transparent md:bg-transparent"
      : "md:fixed md:border-b md:border-line md:bg-cream/95 md:backdrop-blur"
    : "md:border-b md:border-line md:bg-cream/95 md:backdrop-blur";

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-50 bg-header transition-colors duration-300",
        desktopClasses,
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className={cn(
            "font-display text-lg text-white transition-colors",
            light ? "md:text-white md:drop-shadow" : "md:text-secondary",
          )}
        >
          Sabor{" "}
          <span className={cn("text-white", light ? "md:text-white" : "md:text-primary")}>
            de
          </span>{" "}
          Botequim
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-semibold transition-colors",
                light ? "text-white/90 drop-shadow hover:text-white" : "text-ink hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#restaurantes"
            className="ml-2 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow transition-colors hover:bg-primary-strong"
          >
            Vote agora
          </Link>
        </nav>

        <button
          type="button"
          className="text-white md:hidden"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        id="menu-mobile"
        className={cn(
          "border-t border-white/15 bg-header md:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav aria-label="Navegação principal (celular)" className="flex flex-col px-4 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-white/15 py-3 text-sm font-semibold text-white last:border-b-0"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#restaurantes"
            onClick={() => setMenuOpen(false)}
            className="my-3 rounded-lg bg-primary py-3 text-center text-sm font-semibold text-white"
          >
            Vote agora
          </Link>
        </nav>
      </div>
    </header>
  );
}
