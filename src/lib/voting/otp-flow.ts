import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentFestival } from "@/lib/festival";
import { parseBrazilianWhatsApp, maskWhatsApp } from "@/lib/voting/whatsapp";
import { sanitizeVoterName } from "@/lib/voting/name";
import { requestOtpSchema, confirmOtpSchema } from "@/lib/validators/vote";
import { generateOtpCode, hashOtp, hashIp } from "@/lib/voting/otp-crypto";
import { getOtpConfig, getWhatsAppSecrets, TERMS_VERSION } from "@/lib/voting/config";
import { extractErrorCode, friendlyMessage } from "@/lib/voting/errors";
import { rateLimit } from "@/lib/voting/rate-limit";
import { sendVoteOtp, isDevWhatsApp } from "@/services/whatsapp/whatsapp-service";

type FlowResult = {
  status: number;
  body: Record<string, unknown>;
};

function ok(body: Record<string, unknown>): FlowResult {
  return { status: 200, body: { ok: true, ...body } };
}

function fail(status: number, code: string): FlowResult {
  return { status, body: { ok: false, error: friendlyMessage(code), code } };
}

async function logEvent(
  admin: ReturnType<typeof createAdminClient>,
  event: string,
  ctx: { festivalId?: string; restaurantId?: string; categoryId?: string },
) {
  try {
    await admin.from("analytics_events").insert({
      event_name: event,
      festival_id: ctx.festivalId ?? null,
      restaurant_id: ctx.restaurantId ?? null,
      category_id: ctx.categoryId ?? null,
    });
  } catch {
    // Analytics nunca deve derrubar o fluxo de votação.
  }
}

/** Passo 1 — valida dados, gera o código e envia pelo WhatsApp. */
export async function requestVoteOtp(input: unknown, ipHash: string | null, userAgent: string | null): Promise<FlowResult> {
  const parsed = requestOtpSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "INVALID_INPUT");
  }
  const data = parsed.data;

  // Rate limit por IP (defesa extra além do limite por número no banco).
  if (ipHash) {
    const limited = rateLimit(`otp-request:${ipHash}`, 10, 30 * 60_000);
    if (!limited.allowed) return fail(429, "RATE_LIMITED");
  }

  const phone = parseBrazilianWhatsApp(data.whatsapp);
  if (!phone.ok) return fail(400, "INVALID_INPUT");

  const admin = createAdminClient();
  const festival = await getCurrentFestival();
  if (!festival) return fail(400, "VOTING_NOT_ACTIVE");

  // O restaurante define a categoria e (opcionalmente) o prato participante.
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, category_id, status, deleted_at")
    .eq("id", data.restaurantId)
    .eq("festival_id", festival.id)
    .maybeSingle();

  if (!restaurant || restaurant.status !== "active" || restaurant.deleted_at) {
    return fail(400, "RESTAURANT_NOT_AVAILABLE");
  }
  if (!restaurant.category_id) {
    return fail(400, "CATEGORY_NOT_ACTIVE");
  }

  const { data: dish } = await admin
    .from("dishes")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const config = getOtpConfig();
  const secrets = getWhatsAppSecrets();
  const code = generateOtpCode();
  const otpHash = hashOtp(code);
  const voterName = sanitizeVoterName(data.voterName);

  await logEvent(admin, "vote_otp_requested", {
    festivalId: festival.id,
    restaurantId: restaurant.id,
    categoryId: restaurant.category_id,
  });

  const { data: rpcData, error } = await admin.rpc("request_vote_otp", {
    p_festival_id: festival.id,
    p_category_id: restaurant.category_id,
    p_restaurant_id: restaurant.id,
    p_dish_id: dish?.id ?? null,
    p_voter_name: voterName,
    p_whatsapp_e164: phone.e164,
    p_whatsapp_salt: secrets.salt,
    p_encryption_key: secrets.key,
    p_otp_hash: otpHash,
    p_otp_ttl_seconds: config.ttlSeconds,
    p_resend_min_seconds: config.resendMinSeconds,
    p_max_sends_per_window: config.maxSendsPerWindow,
    p_consent_regulation: true,
    p_consent_privacy: true,
    p_terms_version: TERMS_VERSION,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
  });

  if (error) {
    return fail(400, extractErrorCode(error.message));
  }

  const row = rpcData?.[0];
  if (!row) return fail(500, "UNKNOWN");

  const sent = await sendVoteOtp(phone.e164, code, voterName);
  if (!sent.ok) {
    await logEvent(admin, "vote_otp_send_failed", {
      festivalId: festival.id,
      restaurantId: restaurant.id,
      categoryId: restaurant.category_id,
    });
    return fail(502, "SEND_FAILED");
  }

  await logEvent(admin, "vote_otp_sent", {
    festivalId: festival.id,
    restaurantId: restaurant.id,
    categoryId: restaurant.category_id,
  });

  return ok({
    verificationId: row.verification_id,
    maskedWhatsApp: maskWhatsApp(phone.e164),
    resendCount: row.resend_count,
    expiresInSeconds: config.ttlSeconds,
    // Em desenvolvimento devolvemos o código para facilitar o teste do fluxo.
    // Nunca em produção (isDevWhatsApp é falso quando há provedor real).
    devCode: isDevWhatsApp() && process.env.NODE_ENV !== "production" ? code : undefined,
  });
}

/** Passo 2 — confirma o código e registra o voto atomicamente. */
export async function confirmVoteOtp(input: unknown, ipHash: string | null): Promise<FlowResult> {
  const parsed = confirmOtpSchema.safeParse(input);
  if (!parsed.success) {
    return fail(400, "INVALID_INPUT");
  }

  if (ipHash) {
    const limited = rateLimit(`otp-confirm:${ipHash}`, 20, 30 * 60_000);
    if (!limited.allowed) return fail(429, "RATE_LIMITED");
  }

  const admin = createAdminClient();
  const otpHash = hashOtp(parsed.data.code);

  const { data: rpcData, error } = await admin.rpc("verify_vote_otp", {
    p_verification_id: parsed.data.verificationId,
    p_otp_hash_attempt: otpHash,
  });

  if (error) {
    const code = extractErrorCode(error.message);
    if (code === "OTP_INVALID") {
      await logEvent(admin, "vote_otp_invalid", {});
    } else if (code === "OTP_EXPIRED") {
      await logEvent(admin, "vote_otp_expired", {});
    } else if (code === "VOTE_DUPLICATE") {
      await logEvent(admin, "vote_duplicate_blocked", {});
    }
    return fail(400, code);
  }

  const row = rpcData?.[0];
  if (!row) return fail(500, "UNKNOWN");

  await logEvent(admin, "vote_completed", {
    restaurantId: row.restaurant_id,
  });

  return ok({
    protocol: row.protocol,
    restaurantId: row.restaurant_id,
    createdAt: row.created_at,
  });
}
