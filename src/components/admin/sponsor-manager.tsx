"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  createSponsor,
  updateSponsor,
  deleteSponsor,
  setSponsorStatus,
  moveSponsor,
} from "@/actions/sponsors";
import { sponsorSchema, type SponsorInput } from "@/lib/validators/sponsor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { FieldError } from "@/components/ui/field-error";
import { FestivalImageUpload } from "@/components/admin/festival-image-upload";
import { ENTITY_STATUS_LABELS, ENTITY_STATUS_VARIANTS } from "@/lib/format/status-labels";
import type { EntityStatus } from "@/types/database.types";

export type SponsorRow = {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sponsorship_level: string | null;
  status: EntityStatus;
};

export function SponsorManager({ sponsors }: { sponsors: SponsorRow[] }) {
  const [editing, setEditing] = useState<SponsorRow | "new" | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">{sponsors.length} patrocinador(es).</p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className={buttonVariants({ size: "sm", className: "gap-1.5" })}
        >
          <Plus className="size-4" />
          Novo patrocinador
        </button>
      </div>

      {sponsors.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          Nenhum patrocinador ainda. Clique em &quot;Novo patrocinador&quot; para começar.
        </p>
      ) : (
        <ul className="space-y-3">
          {sponsors.map((sponsor, i) => (
            <li
              key={sponsor.id}
              className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3"
            >
              <div className="relative flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cream/60">
                {sponsor.logo_url && (
                  <Image
                    src={sponsor.logo_url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-contain p-1.5"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{sponsor.name}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  {sponsor.sponsorship_level && (
                    <span className="text-xs text-muted">{sponsor.sponsorship_level}</span>
                  )}
                  <Badge variant={ENTITY_STATUS_VARIANTS[sponsor.status]}>
                    {ENTITY_STATUS_LABELS[sponsor.status]}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0 || isPending}
                  onClick={() => startTransition(() => moveSponsor(sponsor.id, "up"))}
                  aria-label="Mover para cima"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={i === sponsors.length - 1 || isPending}
                  onClick={() => startTransition(() => moveSponsor(sponsor.id, "down"))}
                  aria-label="Mover para baixo"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(sponsor)}
                  aria-label="Editar patrocinador"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("Remover este patrocinador?")) {
                      startTransition(() => deleteSponsor(sponsor.id));
                    }
                  }}
                  aria-label="Remover patrocinador"
                  className="flex size-8 items-center justify-center rounded-md text-error hover:bg-error/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <SponsorFormModal
          sponsor={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function SponsorFormModal({
  sponsor,
  onClose,
}: {
  sponsor: SponsorRow | null;
  onClose: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SponsorInput>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: sponsor?.name ?? "",
      logo_url: sponsor?.logo_url ?? "",
      website_url: sponsor?.website_url ?? "",
      sponsorship_level: sponsor?.sponsorship_level ?? "",
      status: sponsor?.status ?? "active",
    },
  });

  const logoUrl = watch("logo_url");

  const onSubmit = (values: SponsorInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = sponsor
        ? await updateSponsor(sponsor.id, values)
        : await createSponsor(values);
      if ("error" in result) setServerError(result.error);
      else onClose();
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={sponsor ? "Editar patrocinador" : "Novo patrocinador"}
      className="sm:max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <FestivalImageUpload
          label="Logomarca"
          purpose="sponsor"
          aspect="aspect-[3/2]"
          hint="JPG, PNG ou WebP, até 5 MB. Prefira fundo transparente (PNG)."
          value={logoUrl}
          onChange={(url) => setValue("logo_url", url, { shouldValidate: true })}
        />
        {errors.logo_url && (
          <p role="alert" className="text-sm font-medium text-error">
            {errors.logo_url.message}
          </p>
        )}

        <div>
          <Label htmlFor="name">Nome do patrocinador</Label>
          <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="website_url">Site (opcional)</Label>
          <Input id="website_url" placeholder="https://" {...register("website_url")} />
        </div>

        <div>
          <Label htmlFor="sponsorship_level">Nível de patrocínio (opcional)</Label>
          <Input
            id="sponsorship_level"
            placeholder="Ex.: ouro, prata, apoio institucional"
            {...register("sponsorship_level")}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />}
            {isPending ? "Salvando…" : "Salvar patrocinador"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
