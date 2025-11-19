import { NextResponse } from "next/server";
import { getCompanies } from "@/lib/db/queries";

export async function GET() {
  try {
    const companies = await getCompanies();

    return NextResponse.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch companies",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
