import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/db";
import type { MediaItem } from "@/lib/types";

export async function GET() {
  try {
    const media = await readJsonFile<MediaItem[]>("media.json");
    return NextResponse.json({ data: media });
  } catch {
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
