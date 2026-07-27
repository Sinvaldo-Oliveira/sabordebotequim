import "server-only";

/**
 * Rate limiting simples em memória por chave (ex.: ip_hash). Suficiente
 * para uma instância única (deploy VPS com PM2 em 1 processo). Para
 * múltiplas instâncias, trocar por um store compartilhado (Redis/Upstash)
 * sem alterar a interface.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Limpeza periódica para o mapa não crescer indefinidamente.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 60_000);
  // Não impedir o processo de encerrar por causa deste timer.
  if (typeof timer === "object" && "unref" in timer) timer.unref();
}
