"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics/track";

export function ShareButton({
  restaurantId,
  title,
  text,
}: {
  restaurantId: string;
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    trackEvent("share_click", restaurantId);
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Usuário cancelou o compartilhamento — nenhuma ação necessária.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border-2 border-line px-3.5 text-sm font-semibold text-ink transition-colors hover:border-secondary hover:text-secondary"
      aria-label="Compartilhar restaurante"
    >
      {copied ? (
        <>
          <Check aria-hidden="true" className="size-4" />
          Link copiado
        </>
      ) : (
        <>
          <Share2 aria-hidden="true" className="size-4" />
          Compartilhar
        </>
      )}
    </button>
  );
}
