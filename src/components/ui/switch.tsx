import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

/** Toggle acessível (checkbox estilizado) com rótulo obrigatório. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface p-3.5",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className={cn(
            "peer sr-only",
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink/15 transition-colors",
            "peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40",
            "after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform",
            "peer-checked:after:translate-x-5",
          )}
        />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-ink">{label}</span>
          {description && (
            <span className="mt-0.5 block text-xs text-muted">{description}</span>
          )}
        </span>
      </label>
    );
  },
);
Switch.displayName = "Switch";
