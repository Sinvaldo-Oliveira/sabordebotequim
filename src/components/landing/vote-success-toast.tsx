"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";

/** Aviso de sucesso no topo da página, fora da árvore do card (via portal). */
export function VoteSuccessToast({
  open,
  voterName,
  restaurantName,
  onDismiss,
}: {
  open: boolean;
  voterName: string;
  restaurantName: string;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const enter = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onDismiss, 30000);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(timer);
    };
  }, [open, onDismiss]);

  if (!open) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-success/20 bg-surface p-4 shadow-xl transition-all duration-500 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 aria-hidden="true" className="size-5" />
        </span>
        <p className="flex-1 text-sm text-ink">
          <strong>{voterName}</strong>, seu voto foi registrado para o restaurante{" "}
          <strong>{restaurantName}</strong> com sucesso!
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="shrink-0 text-muted transition-colors hover:text-ink"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
