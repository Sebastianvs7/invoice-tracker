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
    async (data: InvoiceData[], startIndex: number = 0): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        // Clean up any existing SSE connection
        if (sseCleanupRef.current) {
          sseCleanupRef.current();
        }

        const total = data.length;
        if (startIndex === 0) {
          setUploadProgress({ processed: 0, total, percentage: 0 });
        }

        // Build URL with startIndex for resumable uploads
        const url = `/api/invoices/upload?startIndex=${startIndex}&sse=true`;

        const cleanup = connectSSE(url, data, {
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
          onResume: async (resumeData) => {
            // Update progress
            const percentage = Math.round(
              (resumeData.processed / resumeData.total) * 100
            );
            setUploadProgress({
              processed: resumeData.processed,
              total: resumeData.total,
              percentage,
            });

            // Clean up current connection
            if (sseCleanupRef.current) {
              sseCleanupRef.current();
              sseCleanupRef.current = null;
            }

            // Wait a moment before reconnecting
            await new Promise((r) => setTimeout(r, 500));

            // Reconnect with the new start index
            try {
              await handleUpload(data, resumeData.nextStartIndex);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          onComplete: async (completeData) => {
            setUploadProgress({
              processed: completeData.total,
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
            // Only reject on actual errors, not resume events
            if (errorData.message?.includes("resume")) {
              return; // Resume will be handled by onResume
            }

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
