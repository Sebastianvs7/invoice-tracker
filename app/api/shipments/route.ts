import { NextRequest, NextResponse } from "next/server";
import { getShipmentsWithDetails } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId") || undefined;
    const pageParam = Number(searchParams.get("page") ?? "1");
    const limitParam = Number(searchParams.get("limit") ?? "20");

    const page = Number.isNaN(pageParam) ? 1 : Math.max(1, pageParam);
    const limit = Number.isNaN(limitParam)
      ? 20
      : Math.min(Math.max(1, limitParam), 50);

    const { shipments, hasMore } = await getShipmentsWithDetails({
      companyId,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: shipments,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch shipments",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
