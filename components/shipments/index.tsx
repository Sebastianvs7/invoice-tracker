"use client";

import ShipmentCard from "./shipment-card";
import Filters from "./filters";
import type { ShipmentsProps } from "@/types";
import LoadingMore from "@/components/ui/loading-more";
import { useTranslations } from "@/hooks/use-translations";

const PAGE_SIZE = 15;

export default function Shipments({
  selectedCompanyId,
  setSelectedCompanyId,
  setIsUploadModalOpen,
  error,
  shipments,
  loadMoreRef,
  isFetchingMore,
  hasMore,
  pageSize = PAGE_SIZE,
}: ShipmentsProps) {
  const t = useTranslations();

  return (
    <>
      <Filters
        selectedCompanyId={selectedCompanyId}
        onCompanyChange={setSelectedCompanyId}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shipments.map((shipment, index) => (
          <ShipmentCard
            key={shipment.id}
            shipment={shipment}
            appearDelay={(index % pageSize) * 50}
          />
        ))}
      </div>

      {/* Only render sentinel when there are shipments and more to load */}
      {shipments.length > 0 && hasMore && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {isFetchingMore && <LoadingMore />}

      {!hasMore && shipments.length > 0 && (
        <p className="py-6 text-center text-xs uppercase tracking-wide text-muted-foreground">
          {t.reachedEnd}
        </p>
      )}
    </>
  );
}
