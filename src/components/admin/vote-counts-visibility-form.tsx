"use client";

import { useState, useTransition } from "react";
import { saveVoteCountsVisibility } from "@/actions/festival-settings";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";

export function VoteCountsVisibilityForm({
  festivalId,
  enabled,
}: {
  festivalId: string;
  enabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {error && <Alert variant="error">{error}</Alert>}
      <Switch
        label="Exibir contagem de votos nos cards"
        description="Quando ativado, cada card mostra o número de votos e a ordem dos restaurantes passa a seguir o placar (mais votados primeiro)."
        checked={enabled}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.checked;
          setError(null);
          startTransition(async () => {
            const result = await saveVoteCountsVisibility(festivalId, next);
            if ("error" in result) setError(result.error);
          });
        }}
      />
    </div>
  );
}
