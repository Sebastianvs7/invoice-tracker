"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShipmentsStore } from "@/types";

export const useShipmentsStore = create<ShipmentsStore>()(
  persist(
    (set) => ({
      // Persisted state
      selectedCompanyId: null,
      setSelectedCompanyId: (companyId) =>
        set({ selectedCompanyId: companyId }),

      // Runtime state
      shipments: [],
      setShipments: (shipments) => set({ shipments }),
      appendShipments: (newShipments) =>
        set((state) => ({
          shipments: [...state.shipments, ...newShipments],
        })),
      clearShipments: () => set({ shipments: [] }),

      error: null,
      setError: (error) => set({ error }),

      page: 1,
      setPage: (page) => set({ page }),

      hasMore: true,
      setHasMore: (hasMore) => set({ hasMore }),

      isInitialLoading: true,
      setIsInitialLoading: (isInitialLoading) => set({ isInitialLoading }),

      isFetchingMore: false,
      setIsFetchingMore: (isFetchingMore) => set({ isFetchingMore }),
    }),
    {
      name: "invoice-shipments",
      // Only persist selectedCompanyId
      partialize: (state) => ({
        selectedCompanyId: state.selectedCompanyId,
      }),
    }
  )
);
