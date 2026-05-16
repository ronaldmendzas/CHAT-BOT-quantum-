import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/db";
import { TestDriveLeadSchema } from "@/lib/schema";
import { randomUUID } from "crypto";

const RATE_LIMIT_MAP = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = RATE_LIMIT_MAP.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  RATE_LIMIT_MAP.set(ip, valid);
  return valid.length >= RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = TestDriveLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { nombre, celular, ciudad, producto } = parsed.data;
    const file = await readJsonFile<{ leads: unknown[] }>("leads.json");

    const lead = {
      id: randomUUID(),
      nombre,
      celular,
      ciudad,
      producto,
      canal_origen: "WEB",
      timestamp: new Date().toISOString(),
      estado: "PENDIENTE",
    };

    file.leads.push(lead);
    await writeJsonFile("leads.json", file);

    return NextResponse.json({ success: true, id: lead.id });
  } catch {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
