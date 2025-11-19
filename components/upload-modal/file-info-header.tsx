"use client";

import { FileJson, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import type { FileInfoHeaderProps } from "@/types";

export function FileInfoHeader({
  fileName,
  onRemove,
  isUploading,
}: FileInfoHeaderProps) {
  const t = useTranslations();
  const tModal = t.modal;

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-3">
        <FileJson className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium">{tModal.fileSelected}</p>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={isUploading}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
