"use client";

import { cn } from "@/lib/utils";
import type { SpinnerProps, SpinnerSize } from "@/types";

const sizeMap: Record<SpinnerSize, string> = {
  "1": "h-4 w-4 border-[2px]",
  "2": "h-6 w-6 border-[3px]",
  "3": "h-10 w-10 border-[4px]",
};

export function Spinner({
  size = "2",
  loading = true,
  children,
  label = "Loading",
  className,
}: SpinnerProps) {
  if (!loading) {
    return <>{children}</>;
  }

  const spinnerClass = sizeMap[size] ?? sizeMap["2"];

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-muted-foreground/30 border-t-primary",
          spinnerClass
        )}
      >
        <span className="sr-only">{label}</span>
      </span>
    </span>
  );
}
