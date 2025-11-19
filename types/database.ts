// Database entity types
export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  company_id: string;
  provider: string;
  mode: "EXPORT" | "IMPORT";
  origin_country: string;
  destination_country: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  shipment_id: string;
  invoiced_weight: number;
  invoiced_price: number;
  created_at: string;
}

// Combined types for API responses
export interface ShipmentWithDetails {
  id: string;
  tracking_number: string;
  company: {
    id: string;
    name: string;
  };
  provider: string;
  mode: "EXPORT" | "IMPORT";
  origin_country: string;
  destination_country: string;
  created_at: string;
  latest_invoice: {
    id: string;
    invoiced_weight: number;
    invoiced_price: number;
    created_at: string;
  } | null;
  invoice_count: number;
}
