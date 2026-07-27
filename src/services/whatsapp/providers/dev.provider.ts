import "server-only";

import type {
  SendOtpParams,
  SendOtpResult,
  WhatsAppProvider,
} from "@/services/whatsapp/whatsapp-provider.interface";

/**
 * Provedor de desenvolvimento: não envia nada de verdade. Registra o
 * envio no servidor para permitir testar o fluxo sem uma conta de
 * WhatsApp. É bloqueado automaticamente em produção (ver whatsapp-service).
 */
export class DevWhatsAppProvider implements WhatsAppProvider {
  readonly name = "dev";

  async sendOtp({ to, code }: SendOtpParams): Promise<SendOtpResult> {
    // Só aparece nos logs do servidor de desenvolvimento — nunca em produção.
    console.info(
      `[whatsapp:dev] Código OTP para ${to}: ${code} (modo desenvolvimento — nenhuma mensagem foi enviada de verdade)`,
    );
    return { ok: true, providerMessageId: `dev-${Date.now()}` };
  }
}
