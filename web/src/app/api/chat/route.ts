/* ===== Chat API — Groq LLM is the central brain ===== */

import { NextRequest, NextResponse } from "next/server";
import { chatWithLlm, getSystemPrompt } from "@/lib/llm";
import { processMessage } from "@/lib/conversation";
import type { ConversationContext, Product, Intent } from "@/lib/types";
import { readJsonFile } from "@/lib/db";

function norm(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function detectPanel(message: string, products: Product[]) {
  const t = norm(message);

  if (/\b(test drive|prueba|agendar|probar|cita|testdrive)\b/.test(t)) {
    return { intent: "TEST_DRIVE" as const };
  }

  if (/\b(sucursal|tienda|donde|ubicacion|direccion|local)\b/.test(t)) {
    return { intent: "SUCURSALES" as const };
  }

  const product = products.find((p) => {
    const slug = norm(p.nombre);
    return t.includes(slug) || slug.includes(t);
  });
  if (product) {
    return { intent: "VEHICLE" as const, productId: product.id };
  }

  const typeMap: Record<string, string[]> = {
    auto: ["auto", "carro", "sedan", "suv", "camioneta", "equte", "nexus"],
    moto: ["moto", "scooter", "trimoto", "trooper", "urban", "flashride", "street", "hunter", "colibri"],
    bici: ["bici", "bicicleta", "ara", "a5", "starto", "luna"],
    camion: ["camion", "truck", "ion", "cargo"],
    bus: ["bus", "omnibus", "micro", "coaster"],
    accesorio: ["accesorio", "casco", "candado", "mochila", "cajuela"],
  };

  for (const [type, keywords] of Object.entries(typeMap)) {
    if (keywords.some((k) => t.includes(k))) {
      const ids = products
        .filter((p) => {
          const n = norm(p.nombre);
          if (type === "auto") return n.includes("nexus") || n.includes("equte");
          if (type === "moto") return ["trooper", "urban", "flashride", "street", "hunter", "colibri"].some((k) => n.includes(k));
          if (type === "bici") return ["ara", "a5", "starto", "luna"].some((k) => n.includes(k));
          if (type === "camion") return n.includes("ion");
          if (type === "bus") return n.includes("bus");
          if (type === "accesorio") return p.categoria === "ACCESORIO";
          return false;
        })
        .map((p) => p.id);
      if (ids.length > 0) {
        return { intent: "VEHICLE" as const, productIds: ids };
      }
    }
  }

  return { intent: "WELCOME" as const };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      context,
      history,
    }: {
      message: string;
      context: ConversationContext;
      history: { role: "user" | "assistant"; content: string }[];
    } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    let products: Product[] = [];
    try {
      products = await readJsonFile<Product[]>("products.json");
    } catch {
      // ignore
    }

    const productsJson = JSON.stringify(
      products.map((p) => ({
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        descripcion: p.descripcion_corta,
        autonomia: p.especificaciones?.["Autonomía"] || "",
      })),
      null,
      2
    );

    const messages = [
      { role: "system" as const, content: getSystemPrompt(productsJson) },
      ...history.slice(-12).map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    const llmResult = await chatWithLlm(messages, {
      temperature: 0.85,
      maxTokens: 1024,
    });

    const panel = detectPanel(message, products);

    if (!llmResult.error && llmResult.reply) {
      const meta = llmResult.meta;
      const intent: Intent = meta?.intent ?? panel.intent;
      const productId = meta?.productId ?? panel.productId;
      const productIds = meta?.productIds ?? panel.productIds;
      const step = meta?.contextStep ?? context.step;

      return NextResponse.json({
        reply: llmResult.reply,
        intent,
        productId,
        productIds,
        source: "groq",
        context: { step: step as ConversationContext["step"], filters: context.filters },
      });
    }

    // Fallback to rule-based engine
    const ruleResult = processMessage(message, context, products);
    return NextResponse.json({
      reply: ruleResult.reply,
      intent: ruleResult.intent,
      productId: ruleResult.productId,
      productIds: ruleResult.productIds,
      context: ruleResult.context,
      source: "rules",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
