import { ShipmentWithDetails } from "./database";

export interface ShipmentsQueryOptions {
  companyId?: string;
  page?: number;
  limit?: number;
}

export interface ShipmentsQueryResult {
  shipments: ShipmentWithDetails[];
  hasMore: boolean;
}

