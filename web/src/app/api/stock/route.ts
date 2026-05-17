import { NextResponse } from "next/server";
import { getStock } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const region = searchParams.get("region");

    const stock = await getStock();
    let filtered = stock;

    if (productId) {
      filtered = filtered.filter((s) => s.product_id === productId);
    }
    if (region) {
      filtered = filtered.filter((s) => s.region === region);
    }

    return NextResponse.json({ data: filtered });
  } catch {
    return NextResponse.json({ error: "Failed to load stock" }, { status: 500 });
  }
}
