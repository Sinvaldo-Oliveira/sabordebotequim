"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  Tags,
  Vote,
  Settings,
  Images,
  Handshake,
  UserRound,
  BarChart3,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Visão geral", href: "/admin", icon: Home },
  { label: "Restaurantes", href: "/admin/restaurantes", icon: UtensilsCrossed },
  { label: "Categorias", href: "/admin/categorias", icon: Tags },
  { label: "Votação", href: "/admin/votacao", icon: Vote },
];

const SETTINGS_ITEMS = [
  { label: "Slider-Hero", href: "/admin/configuracoes/slider-hero", icon: Images },
  {
    label: "Carrossel-Patrocinadores",
    href: "/admin/configuracoes/carrossel-patrocinadores",
    icon: Handshake,
  },
  { label: "Idealizador", href: "/admin/configuracoes/idealizador", icon: UserRound },
];

const REPORT_ITEMS = [
  { label: "Ranking-Votação", href: "/admin/relatorios/ranking-votacao", icon: Trophy },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function itemClass(active: boolean) {
    return cn(
      "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors",
      active ? "bg-primary text-white shadow-sm" : "text-ink/70 hover:bg-ink/5 hover:text-ink",
    );
  }

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:block">
      <nav aria-label="Navegação administrativa" className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={itemClass(isActive)}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}

        <p className="mb-1 mt-4 flex items-center gap-2 px-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <BarChart3 aria-hidden="true" className="size-3.5" />
          Relatórios
        </p>
        {REPORT_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(itemClass(isActive), "ml-2")}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}

        <p className="mb-1 mt-4 flex items-center gap-2 px-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <Settings aria-hidden="true" className="size-3.5" />
          Configurações
        </p>
        {SETTINGS_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(itemClass(isActive), "ml-2")}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
