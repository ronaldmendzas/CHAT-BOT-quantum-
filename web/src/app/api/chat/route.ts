/* ===== Chat API — Groq LLM is the central brain ===== */

import { NextRequest, NextResponse } from "next/server";
import { chatWithLlm, getSystemPrompt } from "@/lib/llm";
import { processMessage } from "@/lib/conversation";
import type { ConversationContext, Product } from "@/lib/types";
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

function buildCompactCatalog(products: Product[], panel: ReturnType<typeof detectPanel>): string {
  if (panel.intent === "TEST_DRIVE" || panel.intent === "SUCURSALES") {
    return "Sucursales: La Paz, Santa Cruz, Cochabamba, Sucre, Tarija, Oruro, Potosi, Trinidad. Test Drive requiere licencia vigente y CI.";
  }

  // For generic greetings, send a tiny summary instead of all 26 products
  if (panel.intent === "WELCOME" && !panel.productId && !panel.productIds) {
    return "Autos: Nexus Plus, Equte. Motos: Trooper, Urban, FlashRide, Street, Hunter, Colibri. Bicis: Ara, A5. Camion: Ion. Bus: Quantum Coaster. Accesorios: cascos, candados, mochilas.";
  }

  let relevant = products;
  if (panel.productIds) {
    relevant = products.filter((p) => panel.productIds!.includes(p.id));
  } else if (panel.productId) {
    relevant = products.filter((p) => p.id === panel.productId);
  }

  if (relevant.length === 0) relevant = products;

  return relevant
    .map((p) => {
      const auto = p.especificaciones?.["Autonomía"] || p.especificaciones?.["autonomia"] || "";
      return `${p.nombre} ${p.precio.monto.toLocaleString("es-BO")} ${p.precio.moneda}${auto ? ` ${auto}km` : ""}`;
    })
    .join(" | ");
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

    const panel = detectPanel(message, products);
    const catalog = buildCompactCatalog(products, panel);

    const messages = [
      { role: "system" as const, content: getSystemPrompt(catalog) },
      ...history.slice(-8).map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    const llmResult = await chatWithLlm(messages, {
      temperature: 0.9,
    });

    if (!llmResult.error && llmResult.reply) {
      return NextResponse.json({
        reply: llmResult.reply,
        intent: panel.intent,
        productId: panel.productId,
        productIds: panel.productIds,
        source: "gemini",
        context: { step: panel.intent === "WELCOME" ? "ASKING_TYPE" : context.step, filters: context.filters },
      });
    }

    if (llmResult.rateLimited) {
      return NextResponse.json({
        reply: "¡Hola! Estoy un poco congestionado ahora 😅 Pero acá estoy. ¿Querés que te muestre nuestros modelos, sucursales o agendamos un Test Drive?",
        intent: panel.intent,
        productId: panel.productId,
        productIds: panel.productIds,
        source: "fallback",
        context: { step: "WELCOME", filters: context.filters },
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
