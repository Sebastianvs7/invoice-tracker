"use client";

import { useState, useCallback, useRef } from "react";
import type {
  InvoiceData,
  UseUploadModalProps,
  UseUploadModalReturn,
  UploadProgress,
} from "@/types";
import { useTranslations } from "@/hooks/use-translations";
import { toast } from "@/hooks/use-toast";
import { connectSSE } from "@/lib/sse-client";

export function useUploadModal({
  onClose,
  fetchShipments,
}: UseUploadModalProps): UseUploadModalReturn {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<InvoiceData[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const sseCleanupRef = useRef<(() => void) | null>(null);
  const t = useTranslations();
  const tToast = t.toast;

  const processFile = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setError(null);

      try {
        const text = await selectedFile.text();
        const jsonData = JSON.parse(text);

        if (!Array.isArray(jsonData)) {
          throw new Error(t.jsonMustBeArray);
        }

        setPreviewData(jsonData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t.failedToParseJson;
        setError(errorMessage);
        setPreviewData(null);

        toast({
          variant: "destructive",
          title: tToast.parseError,
          description: tToast.parseErrorDescription,
        });
      }
    },
    [t, tToast]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;
      await processFile(selectedFile);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        await processFile(droppedFile);
      }
    },
    [processFile]
  );

  const handleUpload = useCallback(
    async (data: InvoiceData[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Clean up any existing SSE connection
        if (sseCleanupRef.current) {
          sseCleanupRef.current();
        }

        const total = data.length;
        setUploadProgress({ processed: 0, total, percentage: 0 });

        const cleanup = connectSSE("/api/invoices/upload", data, {
          onProgress: (progressData) => {
            const percentage = Math.round(
              (progressData.processed / progressData.total) * 100
            );
            setUploadProgress({
              processed: progressData.processed,
              total: progressData.total,
              percentage,
            });
          },
          onComplete: async (completeData) => {
            setUploadProgress({
              processed: completeData.processed,
              total: completeData.total,
              percentage: 100,
            });

            await fetchShipments();

            toast({
              variant: "success",
              title: tToast.uploadSuccess,
              description: tToast.uploadSuccessDescription,
            });

            sseCleanupRef.current = null;
            resolve();
          },
          onError: (errorData) => {
            setUploadProgress(null);
            // Translate error message if it's a translation key
            let errorMessage = t.failedToUpload;
            if (errorData.message) {
              const translation = t[errorData.message as keyof typeof t];
              // Only use translation if it's a string, otherwise use the message as-is
              errorMessage =
                typeof translation === "string"
                  ? translation
                  : errorData.message;
            }
            setError(errorMessage);

            toast({
              variant: "destructive",
              title: tToast.uploadError,
              description: tToast.uploadErrorDescription,
            });

            sseCleanupRef.current = null;
            reject(new Error(errorMessage));
          },
        });

        sseCleanupRef.current = cleanup;
      });
    },
    [fetchShipments, t, tToast]
  );

  const handleClose = useCallback(() => {
    // Clean up SSE connection if active
    if (sseCleanupRef.current) {
      sseCleanupRef.current();
      sseCleanupRef.current = null;
    }
    setFile(null);
    setPreviewData(null);
    setError(null);
    setUploadProgress(null);
    onClose();
  }, [onClose]);

  const handleRemoveFile = useCallback(() => {
    // Clean up SSE connection if active
    if (sseCleanupRef.current) {
      sseCleanupRef.current();
      sseCleanupRef.current = null;
    }
    setFile(null);
    setPreviewData(null);
    setError(null);
    setUploadProgress(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!previewData) return;

    setIsUploading(true);
    setError(null);
    try {
      await handleUpload(previewData);
      handleClose();
    } catch (err) {
      // Error is already handled in handleUpload's onError callback
      // Just ensure uploading state is reset
    } finally {
      setIsUploading(false);
    }
  }, [previewData, handleClose, handleUpload]);

  return {
    // State
    file,
    previewData,
    isDragging,
    error,
    isUploading,
    uploadProgress,
    // Actions
    setIsDragging,
    processFile,
    handleFileSelect,
    handleDrop,
    handleClose,
    handleConfirm,
    handleRemoveFile,
  };
}
