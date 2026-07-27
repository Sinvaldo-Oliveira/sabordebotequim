import "server-only";

import type {
  SendOtpParams,
  SendOtpResult,
  WhatsAppProvider,
} from "@/services/whatsapp/whatsapp-provider.interface";
import { buildOtpMessage } from "@/services/whatsapp/otp-message";

type EvolutionConfig = {
  apiUrl: string;
  token: string;
  instanceId: string;
};

/**
 * Evolution API (ou provedor compatível de texto livre). Envia a
 * mensagem de OTP como texto simples para a instância configurada.
 */
export class EvolutionApiProvider implements WhatsAppProvider {
  readonly name = "evolution";

  constructor(private readonly config: EvolutionConfig) {}

  async sendOtp({ to, code, name }: SendOtpParams): Promise<SendOtpResult> {
    const base = this.config.apiUrl.replace(/\/$/, "");
    const url = `${base}/message/sendText/${this.config.instanceId}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          apikey: this.config.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: to.replace(/^\+/, ""),
          text: buildOtpMessage(name, code),
        }),
      });

      if (!response.ok) {
        return { ok: false, error: `evolution_http_${response.status}` };
      }

      const data = (await response.json().catch(() => ({}))) as {
        key?: { id?: string };
      };
      return { ok: true, providerMessageId: data.key?.id };
    } catch {
      return { ok: false, error: "evolution_network_error" };
    }
  }
}
