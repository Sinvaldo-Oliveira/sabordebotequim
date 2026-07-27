"use client";

import { useTransition } from "react";
import { Ban, CheckCircle2 } from "lucide-react";
import { setCategoryStatus } from "@/actions/voting-categories";
import { Button } from "@/components/ui/button";
import type { EntityStatus } from "@/types/database.types";

export function CategoryStatusToggle({ id, status }: { id: string; status: EntityStatus }) {
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next: EntityStatus = status === "active" ? "inactive" : "active";
    startTransition(() => {
      void setCategoryStatus(id, next);
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="size-8 px-0"
      disabled={isPending}
      onClick={toggle}
      aria-label={status === "active" ? "Desativar categoria" : "Ativar categoria"}
      title={status === "active" ? "Desativar" : "Ativar"}
    >
      {status === "active" ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
    </Button>
  );
}
