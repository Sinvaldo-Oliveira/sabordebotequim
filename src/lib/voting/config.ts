import "server-only";

/** Configuração do OTP a partir do ambiente, com defaults seguros. */
export function getOtpConfig() {
  return {
    ttlSeconds: numberEnv("OTP_TTL_SECONDS", 300),
    resendMinSeconds: numberEnv("OTP_RESEND_MIN_SECONDS", 60),
    maxSendsPerWindow: numberEnv("OTP_MAX_SENDS_PER_WINDOW", 3),
  };
}

export function getWhatsAppSecrets() {
  const salt = process.env.WHATSAPP_HASH_SALT;
  const key = process.env.WHATSAPP_ENCRYPTION_KEY;
  if (!salt || !key) {
    throw new Error(
      "WHATSAPP_HASH_SALT e WHATSAPP_ENCRYPTION_KEY são obrigatórios (veja .env.example).",
    );
  }
  return { salt, key };
}

export const TERMS_VERSION = "1.0";

function numberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
