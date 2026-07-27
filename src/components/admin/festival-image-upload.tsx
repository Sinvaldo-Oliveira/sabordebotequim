"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadFestivalMedia } from "@/actions/festival-media";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { describeUploadError } from "@/lib/stale-action-error";

export function FestivalImageUpload({
  label,
  purpose,
  value,
  onChange,
  aspect = "aspect-[1920/1080]",
  hint,
}: {
  label: string;
  purpose: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  aspect?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = `festival-upload-${purpose}`;

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", purpose);
      const result = await uploadFestivalMedia(formData);
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
      {hint && <p className="mb-1.5 text-xs text-muted">{hint}</p>}
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-cream/50",
          aspect,
        )}
      >
        {value && <Image src={value} alt="" fill sizes="640px" className="object-cover" />}
        {!value && !uploading && <ImagePlus aria-hidden="true" className="size-8 text-muted" />}
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
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
