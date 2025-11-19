import { useEffect, useCallback, useRef } from "react";
import { useShipmentsStore } from "@/hooks/use-shipments-store";
import type { UseShipmentsReturn, FetchShipmentsParams } from "@/types";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/i18n";

const DEFAULT_PAGE_SIZE = 15;

export default function useShipments(): UseShipmentsReturn {
  const locale = useLocale();
  const t = getTranslations(locale);

  // Get state and actions from Zustand store
  const shipments = useShipmentsStore((state) => state.shipments);
  const error = useShipmentsStore((state) => state.error);
  const page = useShipmentsStore((state) => state.page);
  const hasMore = useShipmentsStore((state) => state.hasMore);
  const isInitialLoading = useShipmentsStore((state) => state.isInitialLoading);
  const isFetchingMore = useShipmentsStore((state) => state.isFetchingMore);
  const selectedCompanyId = useShipmentsStore(
    (state) => state.selectedCompanyId
  );

  const setShipments = useShipmentsStore((state) => state.setShipments);
  const appendShipments = useShipmentsStore((state) => state.appendShipments);
  const clearShipments = useShipmentsStore((state) => state.clearShipments);
  const setError = useShipmentsStore((state) => state.setError);
  const setPage = useShipmentsStore((state) => state.setPage);
  const setHasMore = useShipmentsStore((state) => state.setHasMore);
  const setIsInitialLoading = useShipmentsStore(
    (state) => state.setIsInitialLoading
  );
  const setIsFetchingMore = useShipmentsStore(
    (state) => state.setIsFetchingMore
  );
  const setSelectedCompanyId = useShipmentsStore(
    (state) => state.setSelectedCompanyId
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchShipments = useCallback(
    async ({ pageParam, replace = false }: FetchShipmentsParams) => {
      const isFirstPage = pageParam === 1;
      if (isFirstPage) {
        setIsInitialLoading(true);
        if (replace) {
          clearShipments();
        }
      } else {
        setIsFetchingMore(true);
      }

      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(pageParam),
          limit: String(DEFAULT_PAGE_SIZE),
        });

        if (selectedCompanyId) {
          params.set("companyId", selectedCompanyId);
        }

        const response = await fetch(`/api/shipments?${params.toString()}`);

        // Check if response is ok before parsing
        if (!response.ok) {
          throw new Error(t.failedToFetchShipments);
        }

        const result = await response.json();

        // If response is successful, treat empty data as valid (not an error)
        if (result.success) {
          const shipmentsData = result.data || [];
          if (replace || isFirstPage) {
            setShipments(shipmentsData);
          } else {
            appendShipments(shipmentsData);
          }
          setHasMore(Boolean(result.hasMore));
          setPage(pageParam);
          // Clear error on successful response, even if empty
          setError(null);
        } else {
          // Only throw error if it's a real failure
          throw new Error(result.error || t.failedToFetchShipments);
        }
      } catch (err) {
        // Only set error for actual failures, not empty results
        const errorMessage =
          err instanceof Error ? err.message : t.failedToFetchShipments;
        setError(errorMessage);
      } finally {
        if (isFirstPage) {
          setIsInitialLoading(false);
        } else {
          setIsFetchingMore(false);
        }
      }
    },
    [
      selectedCompanyId,
      setIsInitialLoading,
      clearShipments,
      setIsFetchingMore,
      setError,
      setShipments,
      appendShipments,
      setHasMore,
      setPage,
      t,
    ]
  );

  const refreshShipments = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchShipments({ pageParam: 1, replace: true });
  }, [fetchShipments, setPage, setHasMore]);

  // Auto-fetch on mount and when company changes
  useEffect(() => {
    refreshShipments();
  }, [refreshShipments, selectedCompanyId]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    // Don't observe if there are no shipments or no more to load
    if (shipments.length === 0 || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasMore &&
          !isFetchingMore &&
          !isInitialLoading &&
          shipments.length > 0
        ) {
          fetchShipments({ pageParam: page + 1 });
        }
      },
      { rootMargin: "0px 0px 200px 0px" }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    fetchShipments,
    hasMore,
    isFetchingMore,
    isInitialLoading,
    page,
    shipments.length,
  ]);

  return {
    shipments,
    error,
    isInitialLoading,
    isFetchingMore,
    hasMore,
    selectedCompanyId,
    loadMoreRef,
    refreshShipments,
    setSelectedCompanyId,
  };
}
