/**
 * Normalização e validação de números de WhatsApp brasileiros.
 * Funções puras (sem dependências) para poderem ser testadas isoladamente.
 */

// DDDs válidos no Brasil (Anatel). Fora desta lista o número é rejeitado.
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export type WhatsAppParseResult =
  | { ok: true; e164: string; ddd: number; lastDigits: string }
  | { ok: false; error: string };

/**
 * Recebe um número em qualquer formato brasileiro e devolve o E.164
 * (+55DDNNNNNNNNN). Aceita com ou sem +55, com máscara, e o dígito 9
 * de celular. Rejeita DDD inválido, tamanho errado e sequências óbvias.
 */
export function parseBrazilianWhatsApp(raw: string): WhatsAppParseResult {
  let digits = (raw ?? "").replace(/\D/g, "");

  // Remove o código do país se veio junto.
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  if (digits.length !== 11) {
    return { ok: false, error: "Informe um celular com DDD e 9 dígitos." };
  }

  const ddd = Number(digits.slice(0, 2));
  if (!VALID_DDDS.has(ddd)) {
    return { ok: false, error: "DDD inválido." };
  }

  // Celular: o primeiro dígito após o DDD deve ser 9.
  if (digits[2] !== "9") {
    return { ok: false, error: "Informe um número de celular válido (começa com 9)." };
  }

  // Rejeita sequências claramente falsas (todos os 9 dígitos iguais).
  const subscriber = digits.slice(2);
  if (/^(\d)\1{8}$/.test(subscriber)) {
    return { ok: false, error: "Número de celular inválido." };
  }

  return {
    ok: true,
    e164: `+55${digits}`,
    ddd,
    lastDigits: digits.slice(-4),
  };
}

/** Máscara para exibição: (31) 9****-1234 a partir do E.164. */
export function maskWhatsApp(e164: string): string {
  const digits = e164.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length !== 11) return e164;
  const ddd = digits.slice(0, 2);
  const last4 = digits.slice(-4);
  return `(${ddd}) 9****-${last4}`;
}
