/**
 * Detecta o erro de "Server Action não encontrada" que acontece quando a
 * página fica aberta desde antes do servidor de desenvolvimento reiniciar
 * (o ID da action mudou). Não tem correção via código — só recarregar a
 * página resolve — então damos uma mensagem específica em vez do genérico
 * "tente novamente", que só confunde nesse caso.
 */
export function describeUploadError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/Server Action|failed to find/i.test(message)) {
    return "Esta página foi atualizada no servidor. Recarregue com Ctrl+Shift+R e envie a imagem de novo.";
  }
  return fallback;
}
