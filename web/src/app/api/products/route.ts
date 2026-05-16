import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/db";
import type { Product } from "@/lib/types";

export async function GET() {
  try {
    const products = await readJsonFile<Product[]>("products.json");
    return NextResponse.json({ data: products });
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
