/** Sanitiza o nome do votante: remove espaços duplicados e das pontas. */
export function sanitizeVoterName(raw: string): string {
  return (raw ?? "").replace(/\s+/g, " ").trim();
}

/** Valida o nome já sanitizado. Função pura para testes. */
export function isValidVoterName(name: string): boolean {
  return name.length >= 3 && name.length <= 120;
}
