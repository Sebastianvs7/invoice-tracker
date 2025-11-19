"use client";

import { useEffect, useState } from "react";
import type { UseCompaniesReturn, Company } from "@/types";

export function useCompanies(): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/companies");
        const result = await response.json();

        if (result.success) {
          setCompanies(result.data);
        } else {
          setError(result.error || "Failed to fetch companies");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch companies";
        setError(errorMessage);
        console.error("Failed to fetch companies:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  return {
    companies,
    isLoading,
    error,
  };
}
