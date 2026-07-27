"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { approveChangeRequest, rejectChangeRequest } from "@/actions/restaurant-change-requests";
import { Button } from "@/components/ui/button";

const FIELD_LABELS: Record<string, string> = {
  short_description: "Descrição curta",
  description: "Descrição completa",
  story: "História",
  phone: "Telefone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  website: "Site",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  address: "Rua",
  number: "Número",
  complement: "Complemento",
  neighborhood: "Bairro",
  postal_code: "CEP",
  logo_url: "Logo",
  banner_url: "Banner",
  opening_hours: "Horário de funcionamento",
  name: "Nome do prato",
  ingredients: "Ingredientes",
  dietary_information: "Restrições alimentares",
  price: "Preço",
  main_image_url: "Foto do prato",
};

function diffEntries(current: Record<string, unknown> | null, requested: Record<string, unknown> | null) {
  if (!requested) return [];
  const c = current ?? {};
  return Object.entries(requested).filter(([key, value]) => {
    return JSON.stringify(value) !== JSON.stringify(c[key]) && key !== "opening_hours";
  });
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(vazio)";
  if (typeof value === "string" && value.startsWith("http")) return "(imagem enviada)";
  return String(value);
}

export function ChangeRequestCard({
  request,
}: {
  request: {
    id: number;
    restaurantName: string;
    createdAt: string;
    currentData: { restaurant: Record<string, unknown> | null; dish: Record<string, unknown> | null };
    requestedData: { restaurant: Record<string, unknown> | null; dish: Record<string, unknown> | null };
  };
}) {
  const [isPending, startTransition] = useTransition();

  const restaurantDiff = diffEntries(request.currentData.restaurant, request.requestedData.restaurant);
  const dishDiff = diffEntries(request.currentData.dish, request.requestedData.dish);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-ink">{request.restaurantName}</p>
          <p className="text-xs text-muted">
            Enviado em {new Date(request.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => startTransition(() => rejectChangeRequest(request.id))}
          >
            <X aria-hidden="true" className="size-4" />
            Rejeitar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => approveChangeRequest(request.id))}
          >
            <Check aria-hidden="true" className="size-4" />
            Aprovar
          </Button>
        </div>
      </div>

      {(restaurantDiff.length > 0 || dishDiff.length > 0) && (
        <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-line pt-3 text-sm sm:grid-cols-2">
          {[...restaurantDiff, ...dishDiff].map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                {FIELD_LABELS[key] ?? key}
              </dt>
              <dd className="truncate text-ink">{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
