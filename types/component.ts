import { ShipmentWithDetails } from "./database";
import type { InvoiceData } from "./invoice";

export interface ShipmentCardProps {
  shipment: ShipmentWithDetails;
  appearDelay?: number;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchShipments: () => Promise<void>;
}

export interface FiltersProps {
  selectedCompanyId: string | null;
  onCompanyChange: (value: string | null) => void;
  onUploadClick: () => void;
}

export interface ShipmentsProps {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (companyId: string | null) => void;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  error: string | null;
  shipments: ShipmentWithDetails[];
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingMore: boolean;
  hasMore: boolean;
  pageSize?: number;
}

export interface EmptyStateProps {
  onUpload: () => void;
}

export interface FileDropzoneProps {
  isDragging: boolean;
  error: string | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FileInfoHeaderProps {
  fileName: string;
  onRemove: () => void;
  isUploading?: boolean;
}

export interface PreviewTableProps {
  data: InvoiceData[];
}

export interface ErrorMessageProps {
  error: string | null;
}

export interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  trackingNumber: string;
}
