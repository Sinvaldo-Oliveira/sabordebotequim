import { z } from "zod";
import { parseBrazilianWhatsApp } from "@/lib/voting/whatsapp";
import { sanitizeVoterName } from "@/lib/voting/name";

// Formato de UUID (aceita qualquer variante — os IDs de seed usam 1111…,
// que não são RFC-4122 estritos). A existência é revalidada no banco.
const uuidLike = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

/** Schema do 1º passo: nome + WhatsApp + consentimentos. */
export const requestOtpSchema = z.object({
  restaurantId: uuidLike,
  voterName: z
    .string()
    .transform(sanitizeVoterName)
    .refine((v) => v.length >= 3, "Informe seu nome completo (mínimo 3 letras).")
    .refine((v) => v.length <= 120, "Nome muito longo."),
  whatsapp: z
    .string()
    .refine((v) => parseBrazilianWhatsApp(v).ok, "Informe um WhatsApp válido com DDD."),
  consentRegulation: z
    .boolean()
    .refine((v) => v === true, "É necessário aceitar o regulamento."),
  consentPrivacy: z
    .boolean()
    .refine((v) => v === true, "É necessário aceitar a Política de Privacidade."),
});

export type RequestOtpInput = z.input<typeof requestOtpSchema>;

/** Schema do 2º passo: código de 6 dígitos. */
export const confirmOtpSchema = z.object({
  verificationId: z.number().int().positive(),
  code: z
    .string()
    .regex(/^\d{6}$/, "O código tem 6 números."),
});

export type ConfirmOtpInput = z.infer<typeof confirmOtpSchema>;
