"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Pencil, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { setRestaurantStatus, softDeleteRestaurant } from "@/actions/restaurants";
import { Button } from "@/components/ui/button";
import type { EntityStatus } from "@/types/database.types";

export function RestaurantRowActions({
  id,
  status,
}: {
  id: string;
  status: EntityStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const toggleStatus = () => {
    const next: EntityStatus = status === "active" ? "inactive" : "active";
    startTransition(() => {
      void setRestaurantStatus(id, next);
    });
  };

  const handleDelete = () => {
    if (!confirm("Remover este restaurante da listagem pública? Os dados são preservados.")) {
      return;
    }
    startTransition(() => {
      void softDeleteRestaurant(id);
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/admin/restaurantes/${id}`}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label="Editar restaurante"
      >
        <Pencil className="size-4" />
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 px-0"
        disabled={isPending}
        onClick={toggleStatus}
        aria-label={status === "active" ? "Desativar restaurante" : "Ativar restaurante"}
        title={status === "active" ? "Desativar" : "Ativar"}
      >
        {status === "active" ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 px-0 text-error hover:bg-error/10"
        disabled={isPending}
        onClick={handleDelete}
        aria-label="Remover restaurante"
        title="Remover"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
