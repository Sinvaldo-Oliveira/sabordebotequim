"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, BarChart3, Share2, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Visão geral", href: "/painel-restaurante", icon: Home },
  { label: "Perfil e prato", href: "/painel-restaurante/perfil", icon: UtensilsCrossed },
];

// Ainda não construídas — aparecem esmaecidas para mostrar a estrutura
// do painel sem linkar para páginas que não existem.
const UPCOMING_ITEMS = [
  { label: "Relatórios", icon: BarChart3 },
  { label: "Divulgação", icon: Share2 },
  { label: "Configurações", icon: Settings },
];

export function RestaurantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:block">
      <nav aria-label="Navegação do painel" className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-leaf text-white shadow-sm"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink",
              )}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}

        <p className="mb-1 mt-4 px-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
          Em breve
        </p>
        {UPCOMING_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <span
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-muted/60"
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {item.label}
            </span>
          );
        })}
      </nav>
    </aside>
  );
}
