import { NextRequest, NextResponse } from "next/server";
import { getInvoiceHistory } from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;

    if (!shipmentId) {
      return NextResponse.json(
        {
          error: "Shipment ID is required",
        },
        { status: 400 }
      );
    }

    const invoices = await getInvoiceHistory(shipmentId);

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch invoice history",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
