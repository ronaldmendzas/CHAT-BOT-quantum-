import { NextResponse } from "next/server";
import { getSucursales } from "@/lib/db";

export async function GET() {
  try {
    const sucursales = await getSucursales();
    return NextResponse.json({ data: sucursales });
  } catch {
    return NextResponse.json({ error: "Failed to load sucursales" }, { status: 500 });
  }
}
