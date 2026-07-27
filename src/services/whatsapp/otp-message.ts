/** Texto padrão da mensagem de OTP (usado pelos provedores de texto livre). */
export function buildOtpMessage(name: string, code: string): string {
  return [
    `Olá, ${name}! 👋`,
    "",
    "A equipe do Sabor de Botequim agradece pela sua participação na votação do Festival Gastronômico e Cultural de Ribeirão das Neves.",
    "",
    `Clique no código para copiá-lo: *${code}*.`,
    "",
    "Digite esse código no sistema para validar o seu voto.",
    "",
    "Por segurança, não compartilhe este código com outras pessoas. Ele possui validade limitada.",
    "",
    "Obrigado por participar e valorizar a gastronomia da nossa cidade! 🍽️",
  ].join("\n");
}
