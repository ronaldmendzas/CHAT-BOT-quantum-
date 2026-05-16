import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/db";
import type { Product } from "@/lib/types";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const products = await readJsonFile<Product[]>("products.json");
    const product = products.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch {
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
