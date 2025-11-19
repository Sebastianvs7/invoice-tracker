"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import UploadModal from "@/components/upload-modal";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import InitialLoading from "@/components/ui/initial-loading";
import Shipments from "@/components/shipments";
import useShipments from "@/hooks/use-shipments";

export default function HomePage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const {
    shipments,
    error,
    isInitialLoading,
    isFetchingMore,
    hasMore,
    selectedCompanyId,
    loadMoreRef,
    refreshShipments,
    setSelectedCompanyId,
  } = useShipments();

  const showEmptyState =
    !isInitialLoading && shipments.length === 0 && !isFetchingMore && !error;

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {isInitialLoading ? (
            <InitialLoading />
          ) : showEmptyState ? (
            <EmptyState onUpload={() => setIsUploadModalOpen(true)} />
          ) : (
            <Shipments
              selectedCompanyId={selectedCompanyId}
              setSelectedCompanyId={setSelectedCompanyId}
              setIsUploadModalOpen={setIsUploadModalOpen}
              error={error}
              shipments={shipments}
              loadMoreRef={loadMoreRef}
              isFetchingMore={isFetchingMore}
              hasMore={hasMore}
            />
          )}
        </main>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        fetchShipments={refreshShipments}
      />

      <Toaster />
    </>
  );
}
