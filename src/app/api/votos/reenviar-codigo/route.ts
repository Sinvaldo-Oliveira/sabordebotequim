import { NextResponse, type NextRequest } from "next/server";
import { requestVoteOtp } from "@/lib/voting/otp-flow";
import { getRequestContext } from "@/lib/voting/request-context";

/**
 * Reenvio compartilha a mesma lógica de solicitação: a RPC reutiliza a
 * verificação existente do número (invalidando o código anterior) e
 * aplica os limites de reenvio. O evento é marcado como resend.
 */
export async function POST(request: NextRequest) {
  const { ipHash, userAgent } = getRequestContext(request);
  const body = await request.json().catch(() => null);
  const result = await requestVoteOtp(body, ipHash, userAgent);
  return NextResponse.json(result.body, { status: result.status });
}
