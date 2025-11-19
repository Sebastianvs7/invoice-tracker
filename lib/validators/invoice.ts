import { z } from "zod";

const providerSchema = z.enum(["GLS", "DPD", "UPS", "PPL", "FedEx"]);
const modeSchema = z.enum(["EXPORT", "IMPORT"]);

export const invoiceDataSchema = z.object({
  id: z.string(),
  shipment: z.object({
    id: z.string(),
    createdAt: z.string().datetime(),
    trackingNumber: z.string(),
    company: z.object({
      id: z.string(),
      name: z.string(),
    }),
    provider: providerSchema,
    mode: modeSchema,
    originCountry: z.string().length(2),
    destinationCountry: z.string().length(2),
  }),
  invoicedWeight: z.number().positive(),
  invoicedPrice: z.number().nonnegative(),
});

export const invoiceArraySchema = z.array(invoiceDataSchema);

export type InvoiceDataInput = z.infer<typeof invoiceDataSchema>;
export type InvoiceArrayInput = z.infer<typeof invoiceArraySchema>;
