export type Provider = "GLS" | "DPD" | "UPS" | "PPL" | "FedEx";

export type ShipmentMode = "EXPORT" | "IMPORT";

export interface ShipmentCompany {
  id: string;
  name: string;
}

// These types are for JSON input format (camelCase)
export interface ShipmentInput {
  id: string;
  createdAt: string;
  trackingNumber: string;
  company: ShipmentCompany;
  provider: Provider;
  mode: ShipmentMode;
  originCountry: string;
  destinationCountry: string;
}

export interface InvoiceInput {
  id: string;
  shipment: ShipmentInput;
  invoicedWeight: number;
  invoicedPrice: number;
}
