"use client";

import { Spinner } from "./spinner";
import { useTranslations } from "@/hooks/use-translations";

export default function InitialLoading() {
  const t = useTranslations();

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <Spinner size="3" label={t.loadingShipments} />
      <p>{t.loadingShipmentsText}</p>
    </div>
  );
}
