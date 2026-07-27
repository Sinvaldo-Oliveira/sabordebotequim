/** Mensagem de erro de campo de formulário, anunciada a leitores de tela. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-error">
      {message}
    </p>
  );
}
