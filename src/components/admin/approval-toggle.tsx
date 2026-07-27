"use client";

import { useTransition } from "react";
import { setRestaurantApprovalRequirement } from "@/actions/restaurant-change-requests";
import { Switch } from "@/components/ui/switch";

export function ApprovalToggle({
  festivalId,
  enabled,
}: {
  festivalId: string;
  enabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      label="Exigir aprovação para alterações dos restaurantes"
      description="Quando ativado, edições enviadas pelo painel do restaurante ficam pendentes até um administrador aprovar."
      checked={enabled}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.checked;
        startTransition(() => setRestaurantApprovalRequirement(festivalId, next));
      }}
    />
  );
}
