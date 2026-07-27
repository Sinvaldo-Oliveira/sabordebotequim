import "server-only";

import type {
  SendOtpParams,
  SendOtpResult,
  WhatsAppProvider,
} from "@/services/whatsapp/whatsapp-provider.interface";
import { buildOtpMessage } from "@/services/whatsapp/otp-message";

type N8nWebhookConfig = {
  webhookUrl: string;
  /** Opcional: token enviado em Authorization: Bearer, se o webhook exigir. */
  token?: string;
};

/**
 * Dispara um workflow do n8n via webhook, delegando a ele o envio real
 * da mensagem de WhatsApp (Evolution API, Meta, Z-API etc. — o que o
 * workflow tiver configurado do outro lado).
 */
export class N8nWebhookProvider implements WhatsAppProvider {
  readonly name = "n8n";

  constructor(private readonly config: N8nWebhookConfig) {}

  async sendOtp({ to, code, name }: SendOtpParams): Promise<SendOtpResult> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
        },
        body: JSON.stringify({
          name,
          phone: to,
          code,
          message: buildOtpMessage(name, code),
        }),
      });

      if (!response.ok) {
        return { ok: false, error: `n8n_http_${response.status}` };
      }

      const data = (await response.json().catch(() => ({}))) as {
        messageId?: string;
        id?: string;
      };
      return { ok: true, providerMessageId: data.messageId ?? data.id };
    } catch {
      return { ok: false, error: "n8n_network_error" };
    }
  }
}
