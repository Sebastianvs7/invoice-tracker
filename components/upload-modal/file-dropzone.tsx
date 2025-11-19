"use client";

import { useRef } from "react";
import { FileJson } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import type { FileDropzoneProps } from "@/types";

export function FileDropzone({
  isDragging,
  error,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();
  const tModal = t.modal;

  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer w-full h-full items-center justify-center flex flex-col ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={onFileSelect}
        />
        <FileJson className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">{tModal.dropzone}</p>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

