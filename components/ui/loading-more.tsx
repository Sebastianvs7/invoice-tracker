"use client";

import { Spinner } from "./spinner";
import { useTranslations } from "@/hooks/use-translations";

export default function LoadingMore() {
  const t = useTranslations();

  return (
    <div className="py-6 flex items-center justify-center gap-3 text-muted-foreground text-sm">
      <Spinner size="2" label={t.loadingMoreShipments} />
      <span>{t.loadingMoreShipmentsText}</span>
    </div>
  );
}
