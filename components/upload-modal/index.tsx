"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "@/hooks/use-translations";
import type { UploadModalProps } from "@/types";
import { useUploadModal } from "@/hooks/use-upload-modal";
import { FileDropzone } from "./file-dropzone";
import { FileInfoHeader } from "./file-info-header";
import { PreviewTable } from "./preview-table";
import { ErrorMessage } from "./error-message";

export default function UploadModal({
  isOpen,
  onClose,
  fetchShipments,
}: UploadModalProps) {
  const t = useTranslations();
  const tModal = t.modal;

  const {
    file,
    previewData,
    isDragging,
    error,
    isUploading,
    uploadProgress,
    setIsDragging,
    handleFileSelect,
    handleDrop,
    handleClose,
    handleConfirm,
    handleRemoveFile,
  } = useUploadModal({ onClose, fetchShipments });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing when uploading
        if (!open && !isUploading) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="w-full max-w-7xl h-[85vh] overflow-hidden flex flex-col"
        showCloseButton={!isUploading}
        onEscapeKeyDown={(e) => {
          // Prevent ESC key from closing when uploading
          if (isUploading) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent clicking outside from closing when uploading
          if (isUploading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">{tModal.title}</DialogTitle>
          <DialogDescription>{tModal.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {!file ? (
            <FileDropzone
              isDragging={isDragging}
              error={error}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onFileSelect={handleFileSelect}
            />
          ) : (
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <FileInfoHeader
                fileName={file.name}
                onRemove={handleRemoveFile}
                isUploading={isUploading}
              />

              {isUploading && uploadProgress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {t.upload.processingInvoice
                        .replace(
                          "{current}",
                          uploadProgress.processed.toString()
                        )
                        .replace("{total}", uploadProgress.total.toString())}
                    </span>
                    <span className="text-muted-foreground">
                      {uploadProgress.percentage}%
                    </span>
                  </div>
                  <Progress value={uploadProgress.percentage} />
                </div>
              )}

              {previewData && <PreviewTable data={previewData} />}
              <ErrorMessage error={error} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {tModal.cancel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!previewData || isUploading}
          >
            {isUploading ? t.uploading : tModal.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
