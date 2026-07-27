import { NextResponse, type NextRequest } from "next/server";
import { confirmVoteOtp } from "@/lib/voting/otp-flow";
import { getRequestContext } from "@/lib/voting/request-context";

export async function POST(request: NextRequest) {
  const { ipHash } = getRequestContext(request);
  const body = await request.json().catch(() => null);
  const result = await confirmVoteOtp(body, ipHash);
  return NextResponse.json(result.body, { status: result.status });
}
