"use client";

import { useTranslations } from "@/hooks/use-translations";
import type { PreviewTableProps } from "@/types";

export function PreviewTable({ data }: PreviewTableProps) {
  const t = useTranslations();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-none">
        <p className="text-sm font-medium mb-2">{t.tablePreview}</p>
      </div>
      <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <div className="min-w-[960px] h-full">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left">{t.invoiceId}</th>
                  <th className="px-4 py-2 text-left">
                    {t.trackingNumberHeader}
                  </th>
                  <th className="px-4 py-2 text-left">{t.company}</th>
                  <th className="px-4 py-2 text-left">{t.provider}</th>
                  <th className="px-4 py-2 text-left">{t.mode}</th>
                  <th className="px-4 py-2 text-right">{t.weightKg}</th>
                  <th className="px-4 py-2 text-right">{t.priceKc}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-t hover:bg-muted/50"
                  >
                    <td className="px-4 py-2 font-mono text-xs">
                      {invoice.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-2">
                      {invoice.shipment.trackingNumber}
                    </td>
                    <td className="px-4 py-2">
                      {invoice.shipment.company.name}
                    </td>
                    <td className="px-4 py-2">{invoice.shipment.provider}</td>
                    <td className="px-4 py-2">{invoice.shipment.mode}</td>
                    <td className="px-4 py-2 text-right">
                      {invoice.invoicedWeight.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {invoice.invoicedPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {t.totalInvoices} {data.length}
      </p>
    </div>
  );
}

