import { createClient } from "@/lib/supabase/server";
import type {
  Company,
  Shipment,
  Invoice,
  InvoiceData,
  ShipmentsQueryOptions,
  ShipmentsQueryResult,
} from "@/types";

/**
 * Upsert a company by ID
 */
export async function upsertCompany(company: {
  id: string;
  name: string;
}): Promise<Company> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .upsert(
      {
        id: company.id,
        name: company.name,
      },
      {
        onConflict: "id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert company: ${error.message}`);
  }

  return data;
}

/**
 * Upsert a shipment by ID or tracking number
 */
export async function upsertShipment(shipment: {
  id: string;
  trackingNumber: string;
  companyId: string;
  provider: string;
  mode: "EXPORT" | "IMPORT";
  originCountry: string;
  destinationCountry: string;
  createdAt: string;
}): Promise<Shipment> {
  const supabase = await createClient();

  // First, try to find existing shipment by tracking number
  const { data: existingShipment } = await supabase
    .from("shipments")
    .select("*")
    .eq("tracking_number", shipment.trackingNumber)
    .single();

  if (existingShipment) {
    // Update existing shipment
    const { data, error } = await supabase
      .from("shipments")
      .update({
        company_id: shipment.companyId,
        provider: shipment.provider,
        mode: shipment.mode,
        origin_country: shipment.originCountry,
        destination_country: shipment.destinationCountry,
      })
      .eq("id", existingShipment.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update shipment: ${error.message}`);
    }

    return data;
  } else {
    // Insert new shipment
    const { data, error } = await supabase
      .from("shipments")
      .insert({
        id: shipment.id,
        tracking_number: shipment.trackingNumber,
        company_id: shipment.companyId,
        provider: shipment.provider,
        mode: shipment.mode,
        origin_country: shipment.originCountry,
        destination_country: shipment.destinationCountry,
        created_at: shipment.createdAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert shipment: ${error.message}`);
    }

    return data;
  }
}

/**
 * Insert a new invoice
 */
export async function insertInvoice(invoice: {
  id: string;
  shipmentId: string;
  invoicedWeight: number;
  invoicedPrice: number;
}): Promise<Invoice> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      id: invoice.id,
      shipment_id: invoice.shipmentId,
      invoiced_weight: invoice.invoicedWeight,
      invoiced_price: invoice.invoicedPrice,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert invoice: ${error.message}`);
  }

  return data;
}

/**
 * Process invoice data: upsert company and shipment, then insert invoice
 */
export async function processInvoiceData(
  invoiceData: InvoiceData
): Promise<void> {
  // Upsert company
  await upsertCompany({
    id: invoiceData.shipment.company.id,
    name: invoiceData.shipment.company.name,
  });

  // Upsert shipment
  const shipment = await upsertShipment({
    id: invoiceData.shipment.id,
    trackingNumber: invoiceData.shipment.trackingNumber,
    companyId: invoiceData.shipment.company.id,
    provider: invoiceData.shipment.provider,
    mode: invoiceData.shipment.mode,
    originCountry: invoiceData.shipment.originCountry,
    destinationCountry: invoiceData.shipment.destinationCountry,
    createdAt: invoiceData.shipment.createdAt,
  });

  // Insert invoice
  await insertInvoice({
    id: invoiceData.id,
    shipmentId: shipment.id,
    invoicedWeight: invoiceData.invoicedWeight,
    invoicedPrice: invoiceData.invoicedPrice,
  });
}

/**
 * Get paginated shipments with their latest invoice and company details
 */
export async function getShipmentsWithDetails({
  companyId,
  page = 1,
  limit = 20,
}: ShipmentsQueryOptions = {}): Promise<ShipmentsQueryResult> {
  const supabase = await createClient();
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(Math.max(1, limit), 50);
  const offset = (normalizedPage - 1) * normalizedLimit;

  let query = supabase
    .from("shipments")
    .select(
      `
      *,
      companies (*),
      invoices (*)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + normalizedLimit);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch shipments: ${error.message}`);
  }

  const shipments = (data || []).map((shipment: any) => {
    const invoices = shipment.invoices || [];
    const sortedInvoices = invoices.sort(
      (a: Invoice, b: Invoice) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestInvoice = sortedInvoices[0] || null;

    return {
      id: shipment.id,
      tracking_number: shipment.tracking_number,
      company: Array.isArray(shipment.companies)
        ? shipment.companies[0]
        : shipment.companies,
      provider: shipment.provider,
      mode: shipment.mode,
      origin_country: shipment.origin_country,
      destination_country: shipment.destination_country,
      created_at: shipment.created_at,
      latest_invoice: latestInvoice
        ? {
            id: latestInvoice.id,
            invoiced_weight: latestInvoice.invoiced_weight,
            invoiced_price: latestInvoice.invoiced_price,
            created_at: latestInvoice.created_at,
          }
        : null,
      invoice_count: invoices.length,
    };
  });

  // Use count to determine if there are more items
  const totalCount = count || 0;
  const hasMore = offset + shipments.length < totalCount;

  return {
    shipments,
    hasMore,
  };
}

/**
 * Get invoice history for a specific shipment
 */
export async function getInvoiceHistory(
  shipmentId: string
): Promise<Invoice[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch invoice history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all companies
 */
export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch companies: ${error.message}`);
  }

  return data || [];
}
