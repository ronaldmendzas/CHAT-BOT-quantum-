import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/db";
import type { TestDriveSlot } from "@/lib/types";

export async function GET() {
  try {
    const slots = await readJsonFile<TestDriveSlot[]>("test-drive-slots.json");
    return NextResponse.json({ data: slots });
  } catch {
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}
