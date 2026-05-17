import { NextResponse } from "next/server";
import { getTestDriveSlots } from "@/lib/db";

export async function GET() {
  try {
    const slots = await getTestDriveSlots();
    return NextResponse.json({ data: slots });
  } catch {
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}
