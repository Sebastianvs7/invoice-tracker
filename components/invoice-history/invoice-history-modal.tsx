"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/hooks/use-translations";
import { useLocale } from "@/hooks/use-locale";
import { useInvoiceHistory } from "@/hooks/use-invoice-history";
import type { InvoiceHistoryModalProps } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime, formatCurrency, formatWeight } from "@/lib/formatters";

export function InvoiceHistoryModal({
  isOpen,
  onClose,
  shipmentId,
  trackingNumber,
}: InvoiceHistoryModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const tHistory = t.history;
  const { invoices, isLoading, error } = useInvoiceHistory({
    shipmentId,
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tHistory.title}</DialogTitle>
          <DialogDescription>
            {t.trackingNumber} {trackingNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="2" label={tHistory.loading} />
              <span className="ml-3 text-muted-foreground">
                {tHistory.loading}
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">
                {error || tHistory.failedToLoad}
              </p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{tHistory.noHistory}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        {tHistory.invoiceDate}
                      </th>
                      <th className="px-4 py-3 text-right">
                        {tHistory.invoiceWeight}
                      </th>
                      <th className="px-4 py-3 text-right">
                        {tHistory.invoicePrice}
                      </th>
                      <th className="px-4 py-3 text-left w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr
                        key={invoice.id}
                        className="border-t hover:bg-muted/50"
                      >
                        <td className="px-4 py-3">
                          {formatDateTime(invoice.created_at, locale)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatWeight(invoice.invoiced_weight)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(invoice.invoiced_price)}
                        </td>
                        <td className="px-4 py-3">
                          {index === 0 && (
                            <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              {tHistory.latest}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
