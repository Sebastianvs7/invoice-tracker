import type { InvoiceData } from "./invoice";
import type { Company } from "./database";
import type { Invoice } from "./invoice";

export interface UseUploadModalProps {
  onClose: () => void;
  fetchShipments: () => Promise<void>;
}

export interface UploadProgress {
  processed: number;
  total: number;
  percentage: number;
}

export interface UseUploadModalReturn {
  // State
  file: File | null;
  previewData: InvoiceData[] | null;
  isDragging: boolean;
  error: string | null;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;

  // Actions
  setIsDragging: (isDragging: boolean) => void;
  processFile: (selectedFile: File) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDrop: (e: React.DragEvent) => Promise<void>;
  handleClose: () => void;
  handleConfirm: () => Promise<void>;
  handleRemoveFile: () => void;
}

export interface UseCompaniesReturn {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
}

export interface UseInvoiceHistoryProps {
  shipmentId: string | null;
  enabled?: boolean;
}

export interface UseInvoiceHistoryReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface FetchShipmentsParams {
  pageParam: number;
  replace?: boolean;
}
