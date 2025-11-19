"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Invoice,
  UseInvoiceHistoryProps,
  UseInvoiceHistoryReturn,
} from "@/types";

export function useInvoiceHistory({
  shipmentId,
  enabled = true,
}: UseInvoiceHistoryProps): UseInvoiceHistoryReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceHistory = useCallback(async () => {
    if (!shipmentId) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${shipmentId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load invoice history");
      }

      setInvoices(result.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load invoice history";
      setError(errorMessage);
      console.error("Failed to fetch invoice history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    if (enabled && shipmentId) {
      fetchInvoiceHistory();
    }
  }, [enabled, shipmentId, fetchInvoiceHistory]);

  return {
    invoices,
    isLoading,
    error,
    refetch: fetchInvoiceHistory,
  };
}
