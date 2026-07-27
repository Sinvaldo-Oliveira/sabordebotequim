/**
 * Contrato de um provedor de envio de WhatsApp. A lógica de votação
 * depende apenas desta interface — trocar de provedor não exige
 * alterar o fluxo de OTP.
 */
export interface SendOtpParams {
  /** Número do destinatário em E.164, ex.: +5531999999999. */
  to: string;
  /** Código OTP em texto puro (usado apenas em memória, nunca persistido). */
  code: string;
  /** Nome do votante, usado para personalizar a mensagem. */
  name: string;
}

export type SendOtpResult =
  | { ok: true; providerMessageId?: string }
  | { ok: false; error: string };

export interface WhatsAppProvider {
  readonly name: string;
  sendOtp(params: SendOtpParams): Promise<SendOtpResult>;
}
