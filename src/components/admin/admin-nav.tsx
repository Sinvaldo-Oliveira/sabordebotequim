"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Visão geral", href: "/admin" },
  { label: "Restaurantes", href: "/admin/restaurantes" },
  { label: "Categorias", href: "/admin/categorias" },
  { label: "Votação", href: "/admin/votacao" },
  { label: "Slider-Hero", href: "/admin/configuracoes/slider-hero" },
  { label: "Carrossel-Patrocinadores", href: "/admin/configuracoes/carrossel-patrocinadores" },
  { label: "Idealizador", href: "/admin/configuracoes/idealizador" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação administrativa"
      className="border-b border-line bg-surface md:hidden"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary text-primary-strong"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
