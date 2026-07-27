import "server-only";

import type {
  SendOtpResult,
  WhatsAppProvider,
} from "@/services/whatsapp/whatsapp-provider.interface";
import { DevWhatsAppProvider } from "@/services/whatsapp/providers/dev.provider";
import { MetaCloudApiProvider } from "@/services/whatsapp/providers/meta-cloud-api.provider";
import { EvolutionApiProvider } from "@/services/whatsapp/providers/evolution-api.provider";
import { N8nWebhookProvider } from "@/services/whatsapp/providers/n8n-webhook.provider";

/**
 * Resolve o provedor de WhatsApp a partir das variáveis de ambiente.
 * O modo "dev" (sem provedor configurado) é bloqueado em produção para
 * nunca "fingir" que enviou um código num ambiente real.
 */
function resolveProvider(): WhatsAppProvider {
  const provider = (process.env.WHATSAPP_PROVIDER ?? "dev").toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (provider === "meta") {
    return new MetaCloudApiProvider({
      apiUrl: requireEnv("WHATSAPP_API_URL"),
      token: requireEnv("WHATSAPP_API_TOKEN"),
      phoneNumberId: requireEnv("WHATSAPP_PHONE_NUMBER_ID"),
      templateName: requireEnv("WHATSAPP_TEMPLATE_NAME"),
      templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "pt_BR",
    });
  }

  if (provider === "evolution") {
    return new EvolutionApiProvider({
      apiUrl: requireEnv("WHATSAPP_API_URL"),
      token: requireEnv("WHATSAPP_API_TOKEN"),
      instanceId: requireEnv("WHATSAPP_INSTANCE_ID"),
    });
  }

  if (provider === "n8n") {
    return new N8nWebhookProvider({
      webhookUrl: requireEnv("N8N_WEBHOOK_URL"),
      token: process.env.WHATSAPP_API_TOKEN || undefined,
    });
  }

  if (isProduction) {
    throw new Error(
      "WHATSAPP_PROVIDER inválido em produção: configure 'meta', 'evolution' ou 'n8n'. O modo 'dev' não é permitido em produção.",
    );
  }

  return new DevWhatsAppProvider();
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não configurada.`);
  }
  return value;
}

export async function sendVoteOtp(to: string, code: string, name: string): Promise<SendOtpResult> {
  const provider = resolveProvider();
  return provider.sendOtp({ to, code, name });
}

/** True quando o provedor atual é o modo de desenvolvimento (sem envio real). */
export function isDevWhatsApp(): boolean {
  const provider = (process.env.WHATSAPP_PROVIDER ?? "dev").toLowerCase();
  return provider !== "meta" && provider !== "evolution" && provider !== "n8n";
}
