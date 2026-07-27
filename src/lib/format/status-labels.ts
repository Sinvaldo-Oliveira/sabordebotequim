import type { BadgeProps } from "@/components/ui/badge";
import type { EntityStatus, FestivalStatus, VotingRule } from "@/types/database.types";

export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Pendente",
  suspended: "Suspenso",
};

export const ENTITY_STATUS_VARIANTS: Record<EntityStatus, NonNullable<BadgeProps["variant"]>> = {
  active: "success",
  inactive: "neutral",
  pending: "warning",
  suspended: "error",
};

export const FESTIVAL_STATUS_LABELS: Record<FestivalStatus, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  active: "Ativo",
  paused: "Pausado",
  closed: "Encerrado",
  tallying: "Em apuração",
  published: "Resultado publicado",
};

export const FESTIVAL_STATUS_VARIANTS: Record<FestivalStatus, NonNullable<BadgeProps["variant"]>> = {
  draft: "neutral",
  scheduled: "primary",
  active: "success",
  paused: "warning",
  closed: "neutral",
  tallying: "warning",
  published: "success",
};

export const VOTING_RULE_LABELS: Record<VotingRule, string> = {
  one_per_festival: "1 voto por telefone em todo o festival",
  one_per_category: "1 voto por telefone por categoria",
  one_per_restaurant: "1 voto por telefone por restaurante",
  one_per_period: "1 voto por telefone a cada período",
  custom: "Regra personalizada",
  one_vote_per_whatsapp_per_festival: "1 voto por WhatsApp em todo o festival",
};

// Regras oferecidas no editor de categorias (a regra por WhatsApp é
// definida no nível do festival, não por categoria).
export const CATEGORY_VOTING_RULES: VotingRule[] = [
  "one_per_festival",
  "one_per_category",
  "one_per_restaurant",
  "one_per_period",
  "custom",
];
