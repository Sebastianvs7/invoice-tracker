"use client";

import type { ErrorMessageProps } from "@/types";

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <p className="text-sm text-destructive text-center">{error}</p>
  );
}

