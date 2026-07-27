import type { EntityStatus, FestivalStatus } from "@/types/database.types";

export type VotingButtonState =
  | "open" // votação ativa — botão "Votar"
  | "not_started" // ainda não começou
  | "paused" // pausada
  | "closed" // encerrada
  | "unavailable"; // restaurante/categoria indisponível

export type AvailabilityInput = {
  festivalStatus: FestivalStatus | null;
  votingStartAt: string | null;
  votingEndAt: string | null;
  restaurantStatus: EntityStatus;
  restaurantDeleted: boolean;
  categoryActive: boolean;
  now?: Date;
};

/**
 * Estado do botão de votação, calculado no servidor a partir do status
 * do festival, restaurante, categoria e da janela de datas. É a fonte de
 * verdade da UI — o backend revalida tudo antes de aceitar o voto.
 */
export function getVotingButtonState(input: AvailabilityInput): VotingButtonState {
  const now = input.now ?? new Date();

  if (input.restaurantStatus !== "active" || input.restaurantDeleted || !input.categoryActive) {
    return "unavailable";
  }

  if (!input.festivalStatus) return "not_started";

  if (input.festivalStatus === "paused") return "paused";

  if (["closed", "tallying", "published"].includes(input.festivalStatus)) {
    return "closed";
  }

  if (input.festivalStatus === "draft" || input.festivalStatus === "scheduled") {
    return "not_started";
  }

  // festivalStatus === "active"
  if (input.votingStartAt && now < new Date(input.votingStartAt)) return "not_started";
  if (input.votingEndAt && now > new Date(input.votingEndAt)) return "closed";

  return "open";
}

export const VOTING_BUTTON_LABEL: Record<VotingButtonState, string> = {
  open: "Votar",
  not_started: "Votação em breve",
  paused: "Votação pausada",
  closed: "Votação encerrada",
  unavailable: "Indisponível",
};
