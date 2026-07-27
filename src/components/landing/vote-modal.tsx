"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { VoteSuccessToast } from "@/components/landing/vote-success-toast";
import { requestOtpSchema, type RequestOtpInput } from "@/lib/validators/vote";
import { maskPhoneInput } from "@/lib/voting/phone-mask";

export type VoteModalRestaurant = {
  id: string;
  name: string;
  slug: string;
  dishName: string | null;
  categoryName: string | null;
};

type Step = "form" | "otp" | "success";

export function VoteModal({
  open,
  onClose,
  onVoted,
  restaurant,
}: {
  open: boolean;
  onClose: () => void;
  onVoted?: () => void;
  restaurant: VoteModalRestaurant;
}) {
  const [step, setStep] = useState<Step>("form");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [maskedWhatsApp, setMaskedWhatsApp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const [code, setCode] = useState("");
  const [protocol, setProtocol] = useState("");
  const [confirmedVoterName, setConfirmedVoterName] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestOtpInput>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: {
      restaurantId: restaurant.id,
      voterName: "",
      whatsapp: "",
      consentRegulation: false,
      consentPrivacy: false,
    },
  });

  const whatsappValue = watch("whatsapp");

  // Reinicia todo o estado sempre que o modal é (re)aberto.
  useEffect(() => {
    if (open) {
      setStep("form");
      setServerError(null);
      setVerificationId(null);
      setMaskedWhatsApp("");
      setDevCode(null);
      setResendIn(0);
      setCode("");
      setProtocol("");
      setConfirmedVoterName("");
      setShowSuccessToast(false);
      reset({
        restaurantId: restaurant.id,
        voterName: "",
        whatsapp: "",
        consentRegulation: false,
        consentPrivacy: false,
      });
    }
  }, [open, restaurant.id, reset]);

  // Contador para liberar o reenvio do código.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function submitForm(values: RequestOtpInput) {
    setServerError(null);
    setPending(true);
    try {
      const res = await fetch("/api/votos/solicitar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.ok) {
        setServerError(data.error);
        return;
      }
      setVerificationId(data.verificationId);
      setMaskedWhatsApp(data.maskedWhatsApp);
      setDevCode(data.devCode ?? null);
      setResendIn(60);
      setStep("otp");
    } catch {
      setServerError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    if (resendIn > 0) return;
    setServerError(null);
    setPending(true);
    try {
      const res = await fetch("/api/votos/reenviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          voterName: watch("voterName"),
          whatsapp: whatsappValue,
          consentRegulation: true,
          consentPrivacy: true,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setServerError(data.error);
        return;
      }
      setVerificationId(data.verificationId);
      setDevCode(data.devCode ?? null);
      setResendIn(60);
      setCode("");
    } catch {
      setServerError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  async function confirm() {
    if (!verificationId || code.length !== 6) return;
    setServerError(null);
    setPending(true);
    try {
      const res = await fetch("/api/votos/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, code }),
      });
      const data = await res.json();
      if (!data.ok) {
        setServerError(data.error);
        return;
      }
      setProtocol(data.protocol);
      setConfirmedVoterName(watch("voterName"));
      setStep("success");
      setShowSuccessToast(true);
      onVoted?.();
      // Atualiza os dados da página (contagem de votos e ordenação dos
      // cards) em segundo plano, sem fechar o modal nem perder o estado.
      router.refresh();
    } catch {
      setServerError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  const title =
    step === "success" ? "Voto confirmado" : step === "otp" ? "Confirme seu voto" : "Confirme seu voto";

  return (
    <>
      <Modal open={open} onClose={onClose} title={title}>
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-cream/70 p-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-white">
          {restaurant.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{restaurant.name}</p>
          <p className="truncate text-xs text-muted">
            {restaurant.dishName ?? restaurant.categoryName ?? "Festival Sabor de Botequim"}
          </p>
        </div>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      {step === "form" && (
        <form onSubmit={handleSubmit(submitForm)} noValidate className="space-y-4">
          <p className="text-sm text-muted">
            Informe seu nome e número de WhatsApp. Enviaremos um código de confirmação para
            validar o seu voto.
          </p>

          <div>
            <Label htmlFor="voterName">Nome completo</Label>
            <Input
              id="voterName"
              autoComplete="name"
              aria-invalid={Boolean(errors.voterName)}
              {...register("voterName")}
            />
            <FieldError message={errors.voterName?.message} />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(31) 99999-9999"
              aria-invalid={Boolean(errors.whatsapp)}
              value={whatsappValue}
              onChange={(e) => setValue("whatsapp", maskPhoneInput(e.target.value))}
            />
            <FieldError message={errors.whatsapp?.message} />
          </div>

          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[var(--brand-primary)]"
              {...register("consentRegulation")}
            />
            <span>
              Li e aceito o{" "}
              <a href="/#regulamento" className="underline" target="_blank" rel="noreferrer">
                regulamento
              </a>{" "}
              do festival.
            </span>
          </label>
          <FieldError message={errors.consentRegulation?.message} />

          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[var(--brand-primary)]"
              {...register("consentPrivacy")}
            />
            <span>
              Li e aceito a{" "}
              <a
                href="/politica-de-privacidade"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                Política de Privacidade
              </a>
              .
            </span>
          </label>
          <FieldError message={errors.consentPrivacy?.message} />

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner />}
            {pending ? "Enviando…" : "Receber código pelo WhatsApp"}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            Seus dados são usados só para validar o voto e nunca são exibidos.
          </p>
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Enviamos um código para o WhatsApp <strong className="text-ink">{maskedWhatsApp}</strong>.
            Digite o código de 6 números para confirmar e registrar o seu voto.
          </p>

          {devCode && (
            <Alert variant="info">
              Modo de desenvolvimento — código: <strong>{devCode}</strong>
            </Alert>
          )}

          <div>
            <Label htmlFor="code">Código de confirmação</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="text-center text-lg tracking-[0.5em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>

          <Button
            type="button"
            onClick={confirm}
            disabled={pending || code.length !== 6}
            className="w-full"
          >
            {pending && <Spinner />}
            {pending ? "Confirmando…" : "Confirmar e votar"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="font-semibold text-muted hover:text-ink"
            >
              Alterar número
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={resendIn > 0 || pending}
              className="font-semibold text-primary-strong disabled:text-muted"
            >
              {resendIn > 0 ? `Reenviar em ${resendIn}s` : "Reenviar código"}
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
            <CheckCircle2 aria-hidden="true" className="size-8" />
          </span>
          <div>
            <p className="text-lg font-bold text-ink">Seu voto foi confirmado!</p>
            <p className="mt-1 text-sm text-muted">
              Obrigado por participar do Festival Sabor de Botequim.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-cream/60 p-4 text-sm">
            <p className="text-ink">
              <strong>{restaurant.name}</strong>
            </p>
            <p className="mt-1 text-muted">Protocolo: {protocol}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={onClose} className="w-full">
              Fechar
            </Button>
            <a
              href={`/restaurantes/${restaurant.slug}`}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border-2 border-secondary text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white"
            >
              Compartilhar restaurante
            </a>
          </div>
        </div>
      )}
      </Modal>
      <VoteSuccessToast
        open={showSuccessToast}
        voterName={confirmedVoterName}
        restaurantName={restaurant.name}
        onDismiss={() => setShowSuccessToast(false)}
      />
    </>
  );
}
