"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShipmentCardProps } from "@/types";
import { ArrowRight, History } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { useLocale } from "@/hooks/use-locale";
import { InvoiceHistoryModal } from "@/components/invoice-history";
import { formatDate, formatCurrency, formatWeight } from "@/lib/formatters";
import { getCountryFlag } from "@/lib/country";

export default function ShipmentCard({
  shipment,
  appearDelay = 0,
}: ShipmentCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const originFlag = getCountryFlag(shipment.origin_country);
  const destinationFlag = getCountryFlag(shipment.destination_country);
  const isExport = shipment.mode === "EXPORT";

  return (
    <Card
      className="flex flex-col animate-fadeInUp"
      style={{ animationDelay: `${appearDelay}ms` }}
    >
      <CardContent className="px-4 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="font-bold text-lg">{shipment.provider}</div>
          <div className="text-sm text-muted-foreground">
            {t.trackingNumber} {shipment.tracking_number}
          </div>
        </div>

        <div className="mb-4 flex justify-between">
          <div className="text-sm font-medium mb-2">
            {shipment.company?.name ?? t.unknownCompany}
          </div>

          <div className="text-sm text-muted-foreground">
            {formatDate(shipment.created_at, locale)}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex w-full justify-between gap-6 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">{t.price}</p>
                <p className="text-2xl font-bold">
                  {shipment.latest_invoice
                    ? formatCurrency(shipment.latest_invoice.invoiced_price)
                    : t.notAvailable}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">{t.weight}</p>
                <p className="text-2xl font-bold">
                  {shipment.latest_invoice
                    ? formatWeight(shipment.latest_invoice.invoiced_weight)
                    : t.notAvailable}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {shipment.invoice_count > 1 && (
              <Badge variant="secondary" className="text-xs w-fit">
                {t.invoicesCount} {shipment.invoice_count}
              </Badge>
            )}
            {shipment.invoice_count > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryOpen(true)}
                className="gap-2 w-fit"
              >
                <History className="h-4 w-4" />
                {t.history.viewHistory}
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{originFlag}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl">{destinationFlag}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={
              isExport
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }
          >
            {shipment.mode}
          </Badge>
        </div>
      </CardFooter>

      <InvoiceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        shipmentId={shipment.id}
        trackingNumber={shipment.tracking_number}
      />
    </Card>
  );
}
