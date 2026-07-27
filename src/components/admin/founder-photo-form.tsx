"use client";

import { useState, useTransition } from "react";
import { saveFounderPhoto } from "@/actions/festival-settings";
import { FestivalImageUpload } from "@/components/admin/festival-image-upload";
import { Alert } from "@/components/ui/alert";

export function FounderPhotoForm({
  festivalId,
  photoUrl,
}: {
  festivalId: string;
  photoUrl: string;
}) {
  const [url, setUrl] = useState(photoUrl);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="max-w-sm space-y-3">
      {error && <Alert variant="error">{error}</Alert>}
      {saved && <Alert variant="success">Foto atualizada.</Alert>}
      <FestivalImageUpload
        label="Foto do idealizador"
        purpose="founder-photo"
        value={url}
        aspect="aspect-square"
        hint="Aparece na seção 'Fale com a organização', ao lado do texto sobre o idealizador."
        onChange={(newUrl) => {
          setUrl(newUrl);
          setSaved(false);
          setError(null);
          startTransition(async () => {
            const result = await saveFounderPhoto(festivalId, newUrl);
            if ("error" in result) setError(result.error);
            else setSaved(true);
          });
        }}
      />
      {isPending && <p className="text-xs text-muted">Salvando…</p>}
    </div>
  );
}
