import { ShipmentWithDetails } from "./database";

export interface ShipmentsStore {
  // Persisted state (user preferences)
  selectedCompanyId: string | null;
  setSelectedCompanyId: (companyId: string | null) => void;

  // Runtime state (not persisted)
  shipments: ShipmentWithDetails[];
  setShipments: (shipments: ShipmentWithDetails[]) => void;
  appendShipments: (shipments: ShipmentWithDetails[]) => void;
  clearShipments: () => void;

  error: string | null;
  setError: (error: string | null) => void;

  page: number;
  setPage: (page: number) => void;

  hasMore: boolean;
  setHasMore: (hasMore: boolean) => void;

  isInitialLoading: boolean;
  setIsInitialLoading: (isLoading: boolean) => void;

  isFetchingMore: boolean;
  setIsFetchingMore: (isFetching: boolean) => void;
}

export interface UseShipmentsReturn {
  shipments: ShipmentWithDetails[];
  error: string | null;
  isInitialLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  selectedCompanyId: string | null;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  refreshShipments: () => Promise<void>;
  setSelectedCompanyId: (companyId: string | null) => void;
}

