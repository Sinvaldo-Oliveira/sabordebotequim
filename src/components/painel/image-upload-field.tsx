"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { uploadRestaurantMedia } from "@/actions/restaurant-media";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { describeUploadError } from "@/lib/stale-action-error";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploadField({
  label,
  restaurantId,
  purpose,
  value,
  onChange,
  aspect = "aspect-video",
}: {
  label: string;
  restaurantId: string;
  purpose: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = `upload-${purpose}`;

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Envie uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("A imagem deve ter até 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("restaurantId", restaurantId);
      formData.append("purpose", purpose);

      const result = await uploadRestaurantMedia(formData);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      onChange(result.url);
    } catch (err) {
      setError(describeUploadError(err, "Não foi possível enviar a imagem. Tente novamente."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-cream/50",
          aspect,
        )}
      >
        {value && (
          <Image src={value} alt="" fill sizes="400px" className="object-cover" />
        )}

        {!value && !uploading && (
          <ImagePlus aria-hidden="true" className="size-8 text-muted" />
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
            <Loader2 aria-hidden="true" className="size-6 animate-spin text-primary" />
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          disabled={uploading}
          aria-label={label}
        />

        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            aria-label={`Remover ${label.toLowerCase()}`}
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
