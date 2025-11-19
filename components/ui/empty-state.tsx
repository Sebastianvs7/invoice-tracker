"use client";

import { Package, Upload } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { Button } from "./button";
import type { EmptyStateProps } from "@/types";

export function EmptyState({ onUpload }: EmptyStateProps) {
  const t = useTranslations().emptyState;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <Package
          className="h-24 w-24 text-muted-foreground relative"
          strokeWidth={1.5}
        />
      </div>
      <h2 className="text-3xl font-semibold mb-3 text-balance">{t.title}</h2>
      <p className="text-muted-foreground mb-8 max-w-md text-pretty">
        {t.description}
      </p>
      <Button onClick={onUpload} size="lg" className="gap-2">
        <Upload className="h-5 w-5" />
        {t.action}
      </Button>
    </div>
  );
}
