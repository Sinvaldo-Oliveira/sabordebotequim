import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const alertVariants = cva("rounded-lg border px-4 py-3 text-sm font-medium", {
  variants: {
    variant: {
      error: "border-error/30 bg-error/8 text-error",
      success: "border-success/30 bg-success/8 text-success",
      warning: "border-warning/30 bg-warning/8 text-warning",
      info: "border-info/30 bg-info/8 text-info",
    },
  },
  defaultVariants: { variant: "info" },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
