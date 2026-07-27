import "server-only";

import { createHash, randomInt } from "node:crypto";

/** Gera um código OTP numérico de 6 dígitos (criptograficamente seguro). */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Hash do código OTP com o pepper do servidor. O código em texto puro
 * nunca é persistido nem logado — só o hash chega ao banco.
 */
export function hashOtp(code: string): string {
  const pepper = process.env.OTP_PEPPER;
  if (!pepper) throw new Error("OTP_PEPPER não configurado.");
  return createHash("sha256").update(`${code}${pepper}`).digest("hex");
}

/** Hash de IP anonimizado (rate limiting sem armazenar o IP em claro). */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${ip}${salt}`).digest("hex");
}
