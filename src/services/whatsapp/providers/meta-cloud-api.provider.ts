import "server-only";

import type {
  SendOtpParams,
  SendOtpResult,
  WhatsAppProvider,
} from "@/services/whatsapp/whatsapp-provider.interface";

type MetaConfig = {
  apiUrl: string;
  token: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
};

/**
 * Meta WhatsApp Cloud API. Usa um template autorizado (categoria
 * "authentication") com o código como parâmetro. Configure o nome do
 * template e o idioma nas variáveis de ambiente.
 */
export class MetaCloudApiProvider implements WhatsAppProvider {
  readonly name = "meta";

  constructor(private readonly config: MetaConfig) {}

  async sendOtp({ to, code }: SendOtpParams): Promise<SendOtpResult> {
    const base = this.config.apiUrl.replace(/\/$/, "");
    const url = `${base}/${this.config.phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/^\+/, ""),
          type: "template",
          template: {
            name: this.config.templateName,
            language: { code: this.config.templateLanguage },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: code }],
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{ type: "text", text: code }],
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        return { ok: false, error: `meta_http_${response.status}` };
      }

      const data = (await response.json()) as {
        messages?: { id: string }[];
      };
      return { ok: true, providerMessageId: data.messages?.[0]?.id };
    } catch {
      return { ok: false, error: "meta_network_error" };
    }
  }
}
