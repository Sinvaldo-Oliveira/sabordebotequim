"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { addGalleryImage, removeGalleryImage } from "@/actions/restaurant-gallery";
import { ImageUploadField } from "@/components/painel/image-upload-field";

export type GalleryPhoto = { id: number; image_url: string };

export function GalleryManager({
  restaurantId,
  photos,
}: {
  restaurantId: string;
  photos: GalleryPhoto[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
            <Image src={photo.image_url} alt="" fill sizes="200px" className="object-cover" />
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => removeGalleryImage(photo.id))}
              aria-label="Remover foto da galeria"
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity hover:bg-error group-hover:opacity-100"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <ImageUploadField
        label="Adicionar foto à galeria"
        restaurantId={restaurantId}
        purpose="gallery"
        value={pendingUrl}
        aspect="aspect-video"
        onChange={(url) => {
          if (!url) return;
          setPendingUrl(null);
          startTransition(() => addGalleryImage(restaurantId, url));
        }}
      />
    </div>
  );
}
