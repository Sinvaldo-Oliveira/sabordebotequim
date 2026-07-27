import "server-only";

import type { NextRequest } from "next/server";
import { hashIp } from "@/lib/voting/otp-crypto";

/** Extrai IP (anonimizado) e user agent de uma requisição de API. */
export function getRequestContext(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? null;
  return {
    ipHash: hashIp(ip),
    userAgent: request.headers.get("user-agent"),
  };
}
