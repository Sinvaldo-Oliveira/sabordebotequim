/**
 * Traduz os códigos de erro internos (lançados pelas RPCs) para mensagens
 * amigáveis. Nunca expõe detalhes técnicos, SQL ou stack trace ao usuário.
 */
const MESSAGES: Record<string, string> = {
  CONSENT_REQUIRED: "É preciso aceitar o regulamento e a Política de Privacidade.",
  VOTING_NOT_ACTIVE: "A votação não está aberta no momento.",
  VOTING_NOT_STARTED: "A votação ainda não começou.",
  VOTING_CLOSED: "A votação já foi encerrada.",
  VOTING_PAUSED: "A votação está pausada no momento.",
  CATEGORY_NOT_ACTIVE: "Esta categoria não está disponível para votação.",
  RESTAURANT_NOT_AVAILABLE: "Este restaurante não está disponível para votação.",
  DISH_NOT_FOUND: "Prato não encontrado.",
  VOTE_DUPLICATE: "Este número de WhatsApp já votou nesta edição do festival.",
  RESEND_TOO_SOON: "Aguarde alguns segundos antes de solicitar um novo código.",
  TOO_MANY_REQUESTS: "Muitas solicitações de código. Tente novamente mais tarde.",
  RATE_LIMITED: "Muitas tentativas. Aguarde um pouco e tente novamente.",
  VERIFICATION_NOT_FOUND: "Não encontramos sua solicitação. Comece a votação novamente.",
  ALREADY_USED: "Este código já foi utilizado.",
  OTP_EXPIRED: "O código expirou. Solicite um novo.",
  OTP_INVALID: "Código incorreto. Confira e tente novamente.",
  TOO_MANY_ATTEMPTS: "Muitas tentativas incorretas. Solicite um novo código.",
  SEND_FAILED: "Não foi possível enviar o código agora. Tente novamente em instantes.",
  INVALID_INPUT: "Verifique os dados informados.",
};

const FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

/** Extrai o código conhecido de uma mensagem de erro do Postgres. */
export function extractErrorCode(message: string | undefined | null): string {
  if (!message) return "UNKNOWN";
  const match = message.match(/[A-Z_]{4,}/);
  const code = match?.[0] ?? "UNKNOWN";
  return code in MESSAGES ? code : "UNKNOWN";
}

export function friendlyMessage(code: string): string {
  return MESSAGES[code] ?? FALLBACK;
}
