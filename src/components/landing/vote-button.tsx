"use client";

import { useState } from "react";
import { VoteModal, type VoteModalRestaurant } from "@/components/landing/vote-modal";
import { trackEvent } from "@/lib/analytics/track";
import {
  VOTING_BUTTON_LABEL,
  type VotingButtonState,
} from "@/lib/voting/availability";
import { cn } from "@/lib/utils/cn";

export function VoteButton({
  state,
  restaurant,
  className,
}: {
  state: VotingButtonState;
  restaurant: VoteModalRestaurant;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(false);

  // Restaurante indisponível: não renderiza botão de voto.
  if (state === "unavailable") {
    return (
      <span
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-lg bg-ink/5 px-3 text-xs font-semibold text-muted",
          className,
        )}
      >
        Indisponível
      </span>
    );
  }

  if (state !== "open" && !voted) {
    return (
      <span
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-lg bg-ink/5 px-3 text-center text-xs font-semibold text-muted",
          className,
        )}
        title={VOTING_BUTTON_LABEL[state]}
      >
        {VOTING_BUTTON_LABEL[state]}
      </span>
    );
  }

  return (
    <>
      {voted ? (
        <span
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-lg bg-success/12 px-3 text-xs font-semibold text-success",
            className,
          )}
        >
          Voto confirmado
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            trackEvent("vote_button_click", restaurant.id);
            trackEvent("vote_modal_open", restaurant.id);
            setOpen(true);
          }}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-strong",
            className,
          )}
        >
          Votar
        </button>
      )}
      {/* Continua montado mesmo após o voto (voted=true) para o modal poder
          concluir a tela de sucesso e o toast — desmontar aqui os fecharia
          na hora, antes de aparecerem. */}
      <VoteModal
        open={open}
        onClose={() => setOpen(false)}
        onVoted={() => setVoted(true)}
        restaurant={restaurant}
      />
    </>
  );
}
