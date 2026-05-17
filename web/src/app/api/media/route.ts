import { NextResponse } from "next/server";
import { getMedia } from "@/lib/db";

export async function GET() {
  try {
    const media = await getMedia();
    return NextResponse.json({ data: media });
  } catch {
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
