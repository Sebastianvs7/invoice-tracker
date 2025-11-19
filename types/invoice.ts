// Types for invoice data structure (from JSON)
export interface InvoiceData {
  id: string;
  shipment: {
    id: string;
    createdAt: string;
    trackingNumber: string;
    company: {
      id: string;
      name: string;
    };
    provider: "GLS" | "DPD" | "UPS" | "PPL" | "FedEx";
    mode: "EXPORT" | "IMPORT";
    originCountry: string;
    destinationCountry: string;
  };
  invoicedWeight: number;
  invoicedPrice: number;
}

// Zod inferred types from validators
export type InvoiceDataInput = {
  id: string;
  shipment: {
    id: string;
    createdAt: string;
    trackingNumber: string;
    company: {
      id: string;
      name: string;
    };
    provider: "GLS" | "DPD" | "UPS" | "PPL" | "FedEx";
    mode: "EXPORT" | "IMPORT";
    originCountry: string;
    destinationCountry: string;
  };
  invoicedWeight: number;
  invoicedPrice: number;
};

export type InvoiceArrayInput = InvoiceDataInput[];
