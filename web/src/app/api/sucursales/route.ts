import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/db";
import type { Sucursal } from "@/lib/types";

export async function GET() {
  try {
    const sucursales = await readJsonFile<Sucursal[]>("sucursales.json");
    return NextResponse.json({ data: sucursales });
  } catch {
    return NextResponse.json({ error: "Failed to load sucursales" }, { status: 500 });
  }
}
